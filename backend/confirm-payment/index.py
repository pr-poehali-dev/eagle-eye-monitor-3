import json
import os
import psycopg2
import urllib.request


TRAINER_SECRET = "forma_zhizni_trainer_2026"


def send_telegram(message: str):
    token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID', '')
    if not token or not chat_id:
        return
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    data = json.dumps({'chat_id': chat_id, 'text': message, 'parse_mode': 'HTML'}).encode()
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        urllib.request.urlopen(req, timeout=5)
    except Exception:
        pass


def handler(event: dict, context) -> dict:
    """
    action=confirm — клиент нажал 'Я оплатил', уведомляем тренера
    action=approve — тренер подтверждает оплату (secret обязателен)
    """
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type'}, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    order_id = body.get('order_id', '').strip()
    action = body.get('action', 'confirm')

    if not order_id:
        return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'order_id обязателен'})}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    cur.execute("SELECT id, client_name, client_phone, goal, status FROM orders WHERE id = %s", (order_id,))
    row = cur.fetchone()

    if not row:
        cur.close()
        conn.close()
        return {'statusCode': 404, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Заявка не найдена'})}

    _, name, phone, goal, status = row

    if action == 'approve':
        secret = body.get('secret', '')
        if secret != TRAINER_SECRET:
            cur.close()
            conn.close()
            return {'statusCode': 403, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Нет доступа'})}
        cur.execute("UPDATE orders SET status = 'paid' WHERE id = %s", (order_id,))
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': True})}

    if status in ('paid', 'awaiting_verification'):
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': True, 'already_sent': True})}

    cur.execute("UPDATE orders SET status = 'awaiting_verification', payment_confirmed_at = NOW() WHERE id = %s", (order_id,))
    conn.commit()
    cur.close()
    conn.close()

    goals_map = {'lose_weight': 'Похудеть', 'gain_muscle': 'Набрать мышцы', 'keep_fit': 'Поддержать форму', 'improve_health': 'Улучшить здоровье'}
    goal_label = goals_map.get(goal, goal or 'не указана')

    send_telegram(
        f"💪 <b>Новый клиент ожидает тренера!</b>\n\n"
        f"👤 <b>Имя:</b> {name}\n"
        f"📱 <b>Телефон:</b> {phone}\n"
        f"🎯 <b>Цель:</b> {goal_label}\n\n"
        f"⚠️ Клиент нажал «Я оплатил» — проверь платёж на Т-банк и подтверди оплату в панели тренера."
    )

    return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': True})}

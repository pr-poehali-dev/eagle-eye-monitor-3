import json
import os
import psycopg2


TRAINER_SECRET = "forma_zhizni_trainer_2026"


def handler(event: dict, context) -> dict:
    """
    GET /?order_id=X — статус заявки клиента
    GET /?secret=TRAINER_SECRET — список всех заявок для тренера
    """
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type'}, 'body': ''}

    params = event.get('queryStringParameters') or {}
    secret = params.get('secret', '')
    order_id = params.get('order_id', '').strip()

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    if secret == TRAINER_SECRET:
        cur.execute(
            "SELECT id, client_name, client_phone, goal, status, created_at FROM orders ORDER BY created_at DESC"
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        goals_map = {'lose_weight': 'Похудеть', 'gain_muscle': 'Набрать мышцы', 'keep_fit': 'Поддержать форму', 'improve_health': 'Улучшить здоровье'}
        orders = [{'id': str(r[0]), 'client_name': r[1], 'client_phone': r[2], 'goal': goals_map.get(r[3], r[3] or ''), 'status': r[4], 'created_at': r[5].isoformat()} for r in rows]
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'orders': orders})}

    if not order_id:
        cur.close()
        conn.close()
        return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'order_id обязателен'})}

    cur.execute("SELECT id, client_name, status FROM orders WHERE id = %s", (order_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return {'statusCode': 404, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Не найдено'})}

    return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'order_id': str(row[0]), 'client_name': row[1], 'status': row[2]})}
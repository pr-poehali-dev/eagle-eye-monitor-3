import json
import os
import psycopg2
from datetime import datetime


TRAINER_SECRET = "forma_zhizni_trainer_2026"


def handler(event: dict, context) -> dict:
    """Чат между клиентом и тренером — отправка и получение сообщений"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type'}, 'body': ''}

    method = event.get('httpMethod', 'GET')
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        order_id = params.get('order_id', '').strip()
        is_trainer = params.get('secret', '') == TRAINER_SECRET

        if not order_id:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'order_id обязателен'})}

        cur.execute("SELECT status FROM orders WHERE id = %s", (order_id,))
        row = cur.fetchone()

        if not row:
            cur.close()
            conn.close()
            return {'statusCode': 404, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Заявка не найдена'})}

        if not is_trainer and row[0] not in ('paid', 'awaiting_verification'):
            cur.close()
            conn.close()
            return {'statusCode': 403, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Оплата не подтверждена'})}

        cur.execute(
            "SELECT id, sender, text, created_at FROM messages WHERE order_id = %s ORDER BY created_at ASC",
            (order_id,)
        )
        msgs = [
            {'id': str(r[0]), 'sender': r[1], 'text': r[2], 'created_at': r[3].isoformat()}
            for r in cur.fetchall()
        ]

        if is_trainer:
            cur.execute("SELECT id, client_name, client_phone, age, weight, height, gender, activity_level, goal, health_notes, status FROM orders WHERE id = %s", (order_id,))
            ord_row = cur.fetchone()
            order_info = None
            if ord_row:
                order_info = {
                    'id': str(ord_row[0]), 'client_name': ord_row[1], 'client_phone': ord_row[2],
                    'age': ord_row[3], 'weight': str(ord_row[4]) if ord_row[4] else None,
                    'height': str(ord_row[5]) if ord_row[5] else None, 'gender': ord_row[6],
                    'activity_level': ord_row[7], 'goal': ord_row[8], 'health_notes': ord_row[9],
                    'status': ord_row[10]
                }
        else:
            order_info = None

        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'messages': msgs, 'order': order_info})
        }

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        order_id = body.get('order_id', '').strip()
        text = body.get('text', '').strip()
        is_trainer = body.get('secret', '') == TRAINER_SECRET
        sender = 'trainer' if is_trainer else 'client'

        if not order_id or not text:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'order_id и text обязательны'})}

        cur.execute("SELECT status FROM orders WHERE id = %s", (order_id,))
        row = cur.fetchone()

        if not row:
            cur.close()
            conn.close()
            return {'statusCode': 404, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Заявка не найдена'})}

        if not is_trainer and row[0] not in ('paid', 'awaiting_verification'):
            cur.close()
            conn.close()
            return {'statusCode': 403, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Оплата не подтверждена'})}

        cur.execute(
            "INSERT INTO messages (order_id, sender, text) VALUES (%s, %s, %s) RETURNING id, created_at",
            (order_id, sender, text)
        )
        msg_id, created_at = cur.fetchone()

        if is_trainer and row[0] == 'awaiting_verification':
            cur.execute("UPDATE orders SET status = 'paid' WHERE id = %s", (order_id,))

        conn.commit()
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'id': str(msg_id), 'sender': sender, 'text': text, 'created_at': created_at.isoformat()})
        }

    cur.close()
    conn.close()
    return {'statusCode': 405, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Method not allowed'})}

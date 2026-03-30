import json
import os
import psycopg2


def handler(event: dict, context) -> dict:
    """Создать заявку с анкетой клиента"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type'}, 'body': ''}

    body = json.loads(event.get('body') or '{}')

    client_name = body.get('client_name', '').strip()
    client_phone = body.get('client_phone', '').strip()

    if not client_name or not client_phone:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Имя и телефон обязательны'})
        }

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    cur.execute(
        """INSERT INTO orders (client_name, client_phone, age, weight, height, gender, activity_level, goal, health_notes)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id""",
        (
            client_name,
            client_phone,
            body.get('age'),
            body.get('weight'),
            body.get('height'),
            body.get('gender'),
            body.get('activity_level'),
            body.get('goal'),
            body.get('health_notes', '')
        )
    )
    order_id = str(cur.fetchone()[0])
    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'order_id': order_id})
    }

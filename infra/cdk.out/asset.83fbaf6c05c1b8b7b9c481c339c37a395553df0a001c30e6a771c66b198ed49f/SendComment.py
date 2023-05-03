import json
import boto3
import os

def lambda_handler(event, context):
    name = os.environ['COMMENT_QUEUE']
    ORIGIN_URL = os.environ['ORIGIN_URL']
    sqs = boto3.resource('sqs')
    
    data = json.loads(event['body'])
    msg = data['message']
    
    try:
        queue = sqs.get_queue_by_name(QueueName=name)
    except:
      return create_response(200, ORIGIN_URL, 'Could not find the queue')
    
    queue.send_message(MessageBody=msg)
    
    return create_response(200, ORIGIN_URL, 'Successfully executed')

def create_response(status, origin, message):
   return {
        'statusCode': status,
        'headers': {
          'Access-Control-Allow-Origin': origin
        },
        'body': json.dumps({'message': message}) + "\n"
    }
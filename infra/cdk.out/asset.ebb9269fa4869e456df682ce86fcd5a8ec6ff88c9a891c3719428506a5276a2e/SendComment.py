import json
import boto3
import os

def lambda_handler(event, context):
    name = os.environ['COMMENT_QUEUE']
    sqs = boto3.resource('sqs')
    
    data = json.loads(event['body'])
    msg = data['message']
    
    try:
        queue = sqs.get_queue_by_name(QueueName=name)
    except:
      return {
        'statusCode': 500,
        'body': json.dumps({'message': 'Could not find the queue'})
      }
    
    
    queue.send_message(MessageBody=msg)
    
    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Successfully executed'})
    }

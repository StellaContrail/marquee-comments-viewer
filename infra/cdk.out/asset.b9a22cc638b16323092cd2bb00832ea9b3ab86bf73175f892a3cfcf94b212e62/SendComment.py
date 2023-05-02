import json
import boto3
import os

def lambda_handler(event, context):
    # Environmental variables
    NAME = os.environ['COMMENT_QUEUE']
    ORIGIN_URL = os.environ['ORIGIN_URL']

    # SQS Handler
    sqs = boto3.resource('sqs')
    
    # Read message from the request
    data = json.loads(event['body'])
    msg = data['message']
    
    try:
        queue = sqs.get_queue_by_name(QueueName=NAME)
    except:
      return create_response(200, ORIGIN_URL, 'Could not find the queue')
    
    queue.send_message(MessageBody=msg)
    return create_response(200, ORIGIN_URL, 'Successfully executed')

# response template
def create_response(status, origin, message):
   return {
        'statusCode': status,
        'headers': {
          'Access-Control-Allow-Origin': origin
        },
        'body': json.dumps({'message': message}) + "\n"
    }
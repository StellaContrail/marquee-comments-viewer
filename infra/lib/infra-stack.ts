import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as iam from 'aws-cdk-lib/aws-iam';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // SQS Queue
    const CommentSQS = new sqs.Queue(this, 'NicoNicoCommentsQueue', {});

    // Lambda
    const KLayer = lambda.LayerVersion.fromLayerVersionArn(this, 'boto3',
      'arn:aws:lambda:ap-northeast-1:770693421928:layer:Klayers-p39-boto3:13');
    const SendCommentLambda = new lambda.Function(this, 'SendCommentFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'SendComment.lambda_handler',
      code: lambda.Code.fromAsset('lib/lambda'),
      environment: {
        COMMENT_QUEUE: CommentSQS.queueName
      },
      layers: [KLayer]
    });
    // SQS Access Permission
    SendCommentLambda.addToRolePolicy(new iam.PolicyStatement({
      resources: [CommentSQS.queueArn],
      actions: ['sqs:SendMessage', 'sqs:GetQueueUrl']
    }));

    // API Gateway
    const api = new apigateway.RestApi(this, 'NicoNicoCommentsAPIEndpoint', {});
    const comment = api.root.addResource('comment');
    comment.addMethod('POST', new apigateway.LambdaIntegration(SendCommentLambda));
  }
}

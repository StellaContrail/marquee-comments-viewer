import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';

export class MarqueeCommentsViewerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    // Create S3 bucket for website
    const websiteBucket = new s3.Bucket(this, 'marquee-comments-viewer', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });

    // Create Original Access Identity(OAC) for CloudFront to acccess the website
    const cloudfrontOAC = new cloudfront.CfnOriginAccessControl(this, 'cloudfront-oac', {
      originAccessControlConfig: {
        description: 'OAC for Marquee Comments Viewer',
        name: 'marquee-comments-viewer-oac',
        originAccessControlOriginType: 's3',
        signingBehavior: 'always',
        signingProtocol: 'sigv4'
      }
    });
    
    // Upload website artifact to the S3 bucket
    // neeed to rebuild react source code before this deployment
    // ref: https://tmokmss.hatenablog.com/entry/20220515/1652623112
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('../web/build')],
      destinationBucket: websiteBucket,
    });

    // Create CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'myDist', {
      defaultBehavior: { 
        origin: new origins.S3Origin(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
      },
      defaultRootObject: 'index.html'
    });
    const cfnDistribution = distribution.node.defaultChild as cloudfront.CfnDistribution;
    cfnDistribution.addPropertyOverride('DistributionConfig.Origins.0.S3OriginConfig.OriginAccessIdentity', '');
    cfnDistribution.addPropertyOverride('DistributionConfig.Origins.0.OriginAccessControlId', cloudfrontOAC.attrId);

    // Add the OAC to the S3 bucket policy
    const websitePolicy = new iam.PolicyStatement({
      sid: 'AllowCloudFrontServicePrinciple',
      effect: iam.Effect.ALLOW,
      principals: [
        new iam.ServicePrincipal('cloudfront.amazonaws.com', {})
      ],
      actions: ['s3:GetObject'],
      resources: [`${websiteBucket.bucketArn}/*`],
      conditions: { StringEquals: {
        'AWS:SourceArn': 'arn:aws:cloudfront::' + cdk.Stack.of(this).account + ':distribution/' + distribution.distributionId
      }}
    });
    websiteBucket.addToResourcePolicy(websitePolicy);

    // Create SQS Queue to hold comments
    const CommentSQS = new sqs.Queue(this, 'MarqueeCommentsViewerQueue', {});

    // Create Lambda to receive comments
    const KLayer = lambda.LayerVersion.fromLayerVersionArn(this, 'boto3',
      'arn:aws:lambda:ap-northeast-1:770693421928:layer:Klayers-p39-boto3:13');
    const SendCommentLambda = new lambda.Function(this, 'SendCommentFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'SendComment.lambda_handler',
      code: lambda.Code.fromAsset('lib/lambda'),
      environment: {
        COMMENT_QUEUE: CommentSQS.queueName,
        ORIGIN_URL: "https://" + distribution.domainName
      },
      layers: [KLayer]
    });
    // Add SQS Permission to Lambda
    SendCommentLambda.addToRolePolicy(new iam.PolicyStatement({
      resources: [CommentSQS.queueArn],
      actions: ['sqs:SendMessage', 'sqs:GetQueueUrl']
    }));

    // Create API Gateway to access the endpoint
    const api = new apigateway.RestApi(this, 'MarqueeCommentsViewerAPI', {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
        statusCode: 200,
      }
    });
    const comment = api.root.addResource('comment');
    comment.addMethod('POST', new apigateway.LambdaIntegration(SendCommentLambda));

    // Upload application configuration to the S3 bucket
    const config = {
      API_BASE_URL: api.url
    }
    new s3deploy.BucketDeployment(this, 'BucketDeployment', {
      sources: [s3deploy.Source.jsonData('config.json', config)],
      destinationBucket: websiteBucket,
    });

  }
}

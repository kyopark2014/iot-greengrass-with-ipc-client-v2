import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3Deploy from "aws-cdk-lib/aws-s3-deployment"
import * as greengrassv2 from 'aws-cdk-lib/aws-greengrassv2';

export class CdkIpcClientStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const deviceName = 'GreengrassCore-18163f7ac3e'
    const accountId = cdk.Stack.of(this).account

    const s3Bucket = new s3.Bucket(this, "gg-depolyment-storage",{
      bucketName: "gg-depolyment-storage",
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: false,
      versioned: false,
    });
    new cdk.CfnOutput(this, 'bucketName', {
      value: s3Bucket.bucketName,
      description: 'The nmae of bucket',
    });
    new cdk.CfnOutput(this, 's3Arn', {
      value: s3Bucket.bucketArn,
      description: 'The arn of s3',
    });
    new cdk.CfnOutput(this, 's3Path', {
      value: 's3://'+s3Bucket.bucketName,
      description: 'The path of s3',
    });

    // copy web application files into s3 bucket
    new s3Deploy.BucketDeployment(this, "UploadArtifact", {
      sources: [s3Deploy.Source.asset("../src")],
      destinationBucket: s3Bucket,
    });

    // deploy components
    new componentDeployment(scope, "component", s3Bucket.bucketName, accountId, deviceName)    
  }
}

export class componentDeployment extends cdk.Stack {
  constructor(scope: Construct, id: string, bucketName: string, accountId: string, deviceName: string, props?: cdk.StackProps) {    
    super(scope, id, props);

    // recipe of component - com.example.publisher
    const version = "1.0.0"
    const recipe_publisher = `{
      "RecipeFormatVersion": "2020-01-25",
      "ComponentName": "com.example.publisher",
      "ComponentVersion": "${version}",
      "ComponentDescription": "A component that publishes messages.",
      "ComponentPublisher": "Amazon",
      "ComponentConfiguration": {
        "DefaultConfiguration": {
          "accessControl": {
            "aws.greengrass.ipc.pubsub": {
              "com.example.publisher:pubsub:1": {
                "policyDescription": "Allows access to publish to all topics.",
                "operations": [
                  "aws.greengrass#PublishToTopic"
                ],
                "resources": [
                  "*"
                ]
              }
            }
          }
        }
      },
      "Manifests": [{
        "Platform": {
          "os": "linux"
        },
        "Lifecycle": {
          "Install": "pip3 install awsiotsdk",
          "Run": "python3 -u {artifacts:path}/publisher.py"
        },
        "Artifacts": [{
          "URI": "${'s3://'+bucketName}/publisher/artifacts/com.example.publisher/1.0.0/publisher.py"
        }]
      }]
    }`

    // recipe of component - com.example.publisher
    new greengrassv2.CfnComponentVersion(this, 'MyCfnComponentVersion-Publisher', {
      inlineRecipe: recipe_publisher,
    });
    
    const recipe_subscriber = `{
      "RecipeFormatVersion": "2020-01-25",
      "ComponentName": "com.example.subscriber",
      "ComponentVersion": "${version}",
      "ComponentDescription": "A component that subscribes messages.",
      "ComponentPublisher": "Amazon",
      "ComponentConfiguration": {
        "DefaultConfiguration": {
          "accessControl": {
            "aws.greengrass.ipc.pubsub": {
              "com.example.subscriber:pubsub:1": {
                "policyDescription": "Allows access to subscribe to all topics.",
                "operations": [
                  "aws.greengrass#SubscribeToTopic"
                ],
                "resources": [
                  "*"
                ]
              }
            }
          }
        }
      },
      "Manifests": [{
        "Platform": {
          "os": "linux"
        },
        "Lifecycle": {
          "Install": "pip3 install awsiotsdk",
          "Run": "python3 -u {artifacts:path}/subscriber.py"
        },
        "Artifacts": [{
          "URI": "${'s3://'+bucketName}/subscriber/artifacts/com.example.subscriber/1.0.0/subscriber.py"
        }]
      }]
    }`

    const cfnComponentVersion2 = new greengrassv2.CfnComponentVersion(this, 'MyCfnComponentVersion_Subscriber', {
      inlineRecipe: recipe_subscriber,
    });

    new cdk.CfnOutput(this, 'componentName', {
      value: cfnComponentVersion2.attrComponentName,
      description: 'The nmae of component',
    });
    
    // deployments
    const cfnDeployment = new greengrassv2.CfnDeployment(this, 'MyCfnDeployment', {
      targetArn: `arn:aws:iot:ap-northeast-2:`+accountId+`:thing/`+deviceName,    
      components: {
        "com.example.publisher": {
          componentVersion: version, 
        },
        "com.example.subscriber": {
          componentVersion: version, 
        },
        "aws.greengrass.Cli": {
          componentVersion: "2.8.1", 
        }
      },
      deploymentName: 'deployment-local-pubsub',
      deploymentPolicies: {
        componentUpdatePolicy: {
          action: 'NOTIFY_COMPONENTS', // NOTIFY_COMPONENTS | SKIP_NOTIFY_COMPONENTS
          timeoutInSeconds: 60,
        },
        failureHandlingPolicy: 'ROLLBACK',  // ROLLBACK | DO_NOTHING
      },
    });   
  }
}

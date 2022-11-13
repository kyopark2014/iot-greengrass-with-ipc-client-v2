# CDK를 이용하여 Greengrass에 IPC Client(V2) 설치

여기서는 CDK를 이용하여 Greengrass 디바이스에 IPC Client(V2)인 "com.example.publisher"와 "com.example.subscriber"를 설치합니다. 

## 배포를 위한 S3 생성 및 파일 복사 

```java
    const s3Bucket = new s3.Bucket(this, "gg-depolyment-storage",{
      bucketName: "gg-depolyment-storage",
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: false,
      versioned: false,
    });
    
    // copy web application files into s3 bucket
    new s3Deploy.BucketDeployment(this, "UploadArtifact", {
      sources: [s3Deploy.Source.asset("../src")],
      destinationBucket: s3Bucket,
    });
```    

## Component 배포하기

S3 생성 및 파일복사하는 시간동안에 배포가 이루어지면 안되므로, 아래와 같이 멀티 스택으로 구현합니다. 

```java
// deploy components
new componentDeployment(scope, "component", s3Bucket.bucketName, accountId, deviceName)    

```java
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
```

# CDK로 IPC Client V2를 Greengrass에 Component로 배포하기

오픈 소스인 [IoT Greengrass](https://github.com/kyopark2014/iot-greengrass)를 이용하여 디바이스에 edge runtime을 구성하고, [AWS Greengrass](https://ap-northeast-2.console.aws.amazon.com/iot/home?region=ap-northeast-2#/greengrassIntro)에서 component를 배포할 수 있습니다. 

[AWS CDK](https://github.com/kyopark2014/technical-summary/blob/main/cdk-introduction.md)는 대표적인 IaC (Infrastructure as Code)로서 Greengrass의 component를 code로 설치하고 관리할 수 있습니다. 또한, [Use the AWS IoT Device SDK to communicate](https://docs.aws.amazon.com/greengrass/v2/developerguide/interprocess-communication.html#ipc-authorization-policies)에 소개된 IPC Client V2는 기존 IPC Client V1에 비하여 callback으로 handler를 구현할 수 있고, 동기(synchronous) 방식도 제공할 수 있습니다. 

여기에서는 IPC Client V2에 기반한 component들을 CDK로 정의하고 배포하는 방법에 대해 설명합니다. 이를 통해, Greengrass에 설치된 Device 사이에서 PUBSUB으로 메시지를 교환할 수 있습니다.

## Greengrass 통신 방법

[Greengrass V2](https://github.com/kyopark2014/iot-greengrass/blob/main/README.md#greengrass-basic)에서는 greengrass.jar, nucleus component의 PubSub service, IotMqttClient service를 이용하여 component와 IoT Core간 PUBSUB 메시지 방식으로 통신을 할 수 있습니다. 

![image](https://user-images.githubusercontent.com/52392004/201517089-27c1e53d-ddbb-4d72-839b-b213ac760215.png)


Greengrass 디바이스에 설치된 component들은 [IPC 통신](https://github.com/kyopark2014/iot-greengrass/blob/main/IPC.md)을 이용하여 PubSub service에 메시지를 보내는 방식으로 통신합니다. 이때 receipe의 ComponentConfiguration에 아래와 같이 "aws.greengrass.ipc.pubsub"을 설정합니다.

Component가 IPC 통신으로 iotMqttClient service로 메시지를 보내면, 이 Topic을 Subscribe하고 있는 IoT Core로 메시지를 보낼 수 있습니다. 아래와 같이 recipe의 ComponentConfiguration에 "aws.greengrass.ipc.mqttproxy"을 설정합니다. 




## Greengrass 설치

[greengrass-installation](https://github.com/kyopark2014/iot-greengrass/blob/main/preparation.md#greengrass-installation)에 따라 greengrass 디바이스에 greengrass를 설치하고 core device로 등록합니다.

## Local에서 component 설치 및 시험

[Local에서 IPC Client들 설치후 테스트](https://github.com/kyopark2014/iot-greengrass-with-ipc-client-v2/blob/main/local-deployment.md)에서는 greengrass 디바이스에 접속해서 local에서 com.example.publisher와 com.example.subscriber를 local에서 설치하고 정상적으로 동작하는것을 로그로 확인하는 방법을 설명합니다. 

## CDK로 component 설치 및 시험

[CDK를 이용하여 Greengrass에 IPC Client(V2) 설치](https://github.com/kyopark2014/iot-greengrass-with-ipc-client-v2/tree/main/cdk-ipc-client)에서는 CDK에서 각 compoent를 구성하고 배포하는 방식에 대해 설명하고 있습니다. 

### CDK 준비 및 설치

#### cdk를 신규로 생성하는 경우

아래와 같이 적절한 폴더에 cdk-iot-client를 생성하고 cdk 초기화를 수행합니다. 

```java
mkdir cdk-iot-client && cd cdk-iot-client
cdk init app --language typescript
```

이후 [cdk-ipc-client-stack.ts](https://github.com/kyopark2014/iot-greengrass-with-ipc-client-v2/blob/main/cdk-ipc-client/lib/cdk-ipc-client-stack.ts)의 body 부분을 복사한후 저장합니다.

아래와 같이 설치합니다. 

```java
cdk deploy --all
```

#### github 코드를 이용하는 경우

cdk 폴더로 이동하여 아래와 같이 설치 합니다. 

```java
cd cdk-ipc-client
cdk deploy --all
```

### 실행결과 확인

CDK로 배포가 잘되면, [Component Console](https://ap-northeast-2.console.aws.amazon.com/iot/home?region=ap-northeast-2#/greengrass/v2/components)에서 "com.example.publisher"와 "com.example.subscriber"가 설치된것을 확인할 수 있습니다.

![image](https://user-images.githubusercontent.com/52392004/201517527-b4c188d8-0bcb-40aa-89ac-29b374b117a4.png)

또한, [Deployment Console](https://ap-northeast-2.console.aws.amazon.com/iot/home?region=ap-northeast-2#/greengrass/v2/deployments)에서 "deployment-local-pubsub" deployment가 아래와 같이 설치됩니다.

![image](https://user-images.githubusercontent.com/52392004/201517558-9220d271-c3c9-4a23-afb3-3761050e6458.png)


Greengrass 디바이스 접속하여 아래와 같이 동작을 확인합니다. 

#### 실행중인 Component 확인 

실행상태를 확인합니다. 

```java
sudo /greengrass/v2/bin/greengrass-cli component list
````

아래와 깉이 com.example.publisher와 com.example.subscriber가 정상적으로 설치되고 실행중임을 알 수 있습니다.

```java
Nov 13, 2022 8:54:18 AM software.amazon.awssdk.eventstreamrpc.EventStreamRPCConnection$1 onConnectionSetup
INFO: Socket connection /greengrass/v2/ipc.socket:8033 to server result [AWS_ERROR_SUCCESS]
Nov 13, 2022 8:54:18 AM software.amazon.awssdk.eventstreamrpc.EventStreamRPCConnection$1 onProtocolMessage
INFO: Connection established with event stream RPC server
Components currently running in Greengrass:
Component Name: com.example.publisher
    Version: 1.0.0
    State: RUNNING
    Configuration: {"accessControl":{"aws.greengrass.ipc.pubsub":{"com.example.publisher:pubsub:1":{"operations":["aws.greengrass#PublishToTopic"],"policyDescription":"Allows access to publish to all topics.","resources":["*"]}}}}
Component Name: com.example.subscriber
    Version: 1.0.0
    State: RUNNING
    Configuration: {"accessControl":{"aws.greengrass.ipc.pubsub":{"com.example.subscriber:pubsub:1":{"operations":["aws.greengrass#SubscribeToTopic"],"policyDescription":"Allows access to subscribe to all topics.","resources":["*"]}}}}
```    

#### Local PUBSUB르로 메시지 수신 확인

아래와 같이 메시지가 수신되는것을 로그로 확인할 수 있습니다. 

```java
sudo cat /greengrass/v2/logs/com.example.subscriber.log
```

이때의 결과는 아래와 같습니다. 

```java
2022-11-13T08:54:19.679Z [INFO] (Copier) com.example.subscriber: stdout. Received new message on topic local/topic: hello. {scriptName=services.com.example.subscriber.lifecycle.Run, serviceName=com.example.subscriber, currentState=RUNNING}
2022-11-13T08:54:24.686Z [INFO] (Copier) com.example.subscriber: stdout. Received new message on topic local/topic: hello. {scriptName=services.com.example.subscriber.lifecycle.Run, serviceName=com.example.subscriber, currentState=RUNNING}
2022-11-13T08:54:29.692Z [INFO] (Copier) com.example.subscriber: stdout. Received new message on topic local/topic: hello. {scriptName=services.com.example.subscriber.lifecycle.Run, serviceName=com.example.subscriber, currentState=RUNNING}
2022-11-13T08:54:34.697Z [INFO] (Copier) com.example.subscriber: stdout. Received new message on topic local/topic: hello. {scriptName=services.com.example.subscriber.lifecycle.Run, serviceName=com.example.subscriber, currentState=RUNNING}
```

### Component 삭제

CDK로 인프라를 삭제할때에는 "cdk destory"로 진행할 수 있으나, Greengrass은 디바이스에 설치되므로, [cdk-ipc-client-stack.ts](https://github.com/kyopark2014/iot-greengrass-with-ipc-client-v2/blob/main/cdk-ipc-client/lib/cdk-ipc-client-stack.ts)의 greengrassv2.CfnDeployment에서 아래의 "com.example.publisher"와 "com.example.subscriber"을 삭제한 후에 재포하거나 console의 deployment에서 삭제하여야 합니다.

```python
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
```    

이후, AWS Greengrass의 Component 정보들을 삭제하기 위해 아래와 같은 명령어를 사용합니다. 

```java
cdk destroy --all
```

## Reference 

[Use the AWS IoT Device SDK to communicate with the Greengrass nucleus, other components, and AWS IoT Core](https://docs.aws.amazon.com/greengrass/v2/developerguide/interprocess-communication.html#ipc-authorization-policies)


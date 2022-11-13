# AWS CDK로 IPC Client V2를 Greengrass에 Component로 등록하여 사용하기

## Greengrass 설치

[greengrass-installation](https://github.com/kyopark2014/iot-greengrass/blob/main/preparation.md#greengrass-installation)에 따라 greengrass 디바이스에 greengrass를 설치하고 core device로 등록합니다.

## Local에서 component 설치 및 시험

[Local에서 IPC Client들 설치후 테스트](https://github.com/kyopark2014/iot-greengrass-with-ipc-client-v2/blob/main/local-deployment.md)에서는 greengrass 디바이스에 접속해서 local에서 com.example.publisher와 com.example.subscriber를 local에서 설치하고 정상적으로 동작하는것을 로그로 확인하는 방법을 설명합니다. 

## CDK로 component 설치 및 시험

[AWS CDK](https://github.com/kyopark2014/technical-summary/blob/main/cdk-introduction.md)는 대표적인 IaC (Infrastructure as Code)로서 아래와 같이 code로 component들을 설치하고 관리할 수 있습니다.



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

### 인프라 삭제

Component들을 삭제할 경우에 아래와 같은 명령어를 사용합니다. 

```java
cdk destroy --all
```



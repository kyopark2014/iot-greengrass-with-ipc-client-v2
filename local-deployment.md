# Local에서 IPC Client들 설치후 테스트

## Greengrass 설치 

- greengrass 설치

- greengrass cli 설치 

## IPC Client V2 설치 

### Publisher 설치 

아래와 같이 소스를 다운로드하고 해당 폴더로 이동합니다. 

```java
git clone https://github.com/kyopark2014/iot-greengrass-with-ipc-client-v2
cd iot-greengrass-with-ipc-client-v2/src/publisher
```

publisher.sh가 실행가능하도록 퍼미션을 부여합니다. 

```java
chmod a+x publisher.sh 
```

아래처럼 실행합니다. 

```java
./publisher.sh 
Nov 13, 2022 5:55:36 AM software.amazon.awssdk.eventstreamrpc.EventStreamRPCConnection$1 onConnectionSetup
INFO: Socket connection /greengrass/v2/ipc.socket:8033 to server result [AWS_ERROR_SUCCESS]
Nov 13, 2022 5:55:36 AM software.amazon.awssdk.eventstreamrpc.EventStreamRPCConnection$1 onProtocolMessage
INFO: Connection established with event stream RPC server
Local deployment submitted! Deployment Id: 55df7978-40ad-41e6-9f01-1a5ab9dc4a62
```

[Greengrass 명령어와 중요한 메모들](https://github.com/kyopark2014/iot-greengrass/blob/main/greengrass-commands.md)을 참조하여 아래와 같이 설치 상태를 확인합니다. 

```java
sudo /greengrass/v2/bin/greengrass-cli component list
```

이때, 아래와 같이 com.example.publisher가 component로 등록된것을 확인할 수 있습니다.

```java
Nov 13, 2022 5:57:46 AM software.amazon.awssdk.eventstreamrpc.EventStreamRPCConnection$1 onConnectionSetup
INFO: Socket connection /greengrass/v2/ipc.socket:8033 to server result [AWS_ERROR_SUCCESS]
Nov 13, 2022 5:57:46 AM software.amazon.awssdk.eventstreamrpc.EventStreamRPCConnection$1 onProtocolMessage
INFO: Connection established with event stream RPC server
Components currently running in Greengrass:
Component Name: com.example.publisher
    Version: 1.0.0
    State: RUNNING
    Configuration: {"accessControl":{"aws.greengrass.ipc.pubsub":{"com.example.publisher:pubsub:1":{"operations":["aws.greengrass#PublishToTopic"],"policyDescription":"Allows access to publish to all topics.","resources":["*"]}}}}
```






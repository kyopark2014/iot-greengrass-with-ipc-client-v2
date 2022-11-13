# IPC Client V2를 Greengras에 Component로 등록하여 사용하기

## Greengrass 설치

[greengrass-installation](https://github.com/kyopark2014/iot-greengrass/blob/main/preparation.md#greengrass-installation)에 따라 greengrass 디바이스에 greengrass를 설치하고 core device로 등록합니다.

## local에서 client 테스트 하기

[Local에서 IPC Client들 설치후 테스트](https://github.com/kyopark2014/iot-greengrass-with-ipc-client-v2/blob/main/local-deployment.md)에서는 greengrass 디바이스에 접속해서 local에서 com.example.publisher와 com.example.subscriber를 local에서 설치하고 정상적으로 동작하는것을 로그로 확인하는 방법을 설명합니다. 

## CDK로 인프라 설치 및 시험 

Git Repository를 다운로드하거나, cdk를 사용할 수 있도록 초기화 한후에 [cdk-ipc-client-stack.ts](https://github.com/kyopark2014/iot-greengrass-with-ipc-client-v2/blob/main/cdk-ipc-client/lib/cdk-ipc-client-stack.ts)을 참조하여 cdk-ipc-client-stack.ts을 편집합니다.

#### cdk를 신규로 생성하는 경우

```java
mkdir cdk-iot-client && cd cdk-iot-client
cdk init app --language typescript
```

이후 [cdk-ipc-client-stack.ts](https://github.com/kyopark2014/iot-greengrass-with-ipc-client-v2/blob/main/cdk-ipc-client/lib/cdk-ipc-client-stack.ts)의 body 부분을 복사한후 저장합니다.

아래와 같이 설치합니다. 

```java
cdk deploy
```

#### github 코드를 이용하는 경우

cdk 폴더로 이동하여 아래와 같이 설치 합니다. 

```java
cd cdk-ipc-client
cdk deply
```





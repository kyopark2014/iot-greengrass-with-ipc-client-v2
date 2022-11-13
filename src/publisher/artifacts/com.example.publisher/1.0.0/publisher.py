import sys
import traceback
from awsiot.greengrasscoreipc.clientv2 import GreengrassCoreIPCClientV2
from awsiot.greengrasscoreipc.model import (
    PublishMessage,
    BinaryMessage
)

def main():
    topic = 'local/topic'
    message = 'hello'

    try:
        ipc_client = GreengrassCoreIPCClientV2()
        binary_message = BinaryMessage(message=bytes(message, 'utf-8'))
        publish_message = PublishMessage(binary_message=binary_message)
        ipc_client.publish_to_topic(topic=topic, publish_message=publish_message)

    except Exception:
        print('Exception occurred', file=sys.stderr)
        traceback.print_exc()
        exit(1)

if __name__ == '__main__':
    main()        
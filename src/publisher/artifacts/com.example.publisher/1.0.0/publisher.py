import sys
import traceback
import time
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

        try:
            while True: 
                publish_binary_message_to_topic(ipc_client, topic, message)
                time.sleep(5)
        except InterruptedError:
            print('Publisher interrupted.')                

    except Exception:
        print('Exception occurred', file=sys.stderr)
        traceback.print_exc()
        exit(1)

def publish_binary_message_to_topic(ipc_client, topic, message):
    binary_message = BinaryMessage(message=bytes(message, 'utf-8'))
    publish_message = PublishMessage(binary_message=binary_message)
    ipc_client.publish_to_topic(topic=topic, publish_message=publish_message)

if __name__ == '__main__':
    main()        
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  TextInput,
} from "react-native";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
} from "firebase/firestore";
import { users } from "../config/customUser";
import { auth, database } from "../config/firebase";

const CustomChat = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);

  const { width, height } = Dimensions.get("screen");

  const scrollViewRef = useRef(null);

  useEffect(() => {
    scrollViewRef.current.scrollToEnd({ animated: false });
  }, []);

  const handleContentSizeChange = () => {
    scrollViewRef.current.scrollToEnd({ animated: false });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Chat Room #random",
    });
  }, [navigation]);

  useLayoutEffect(() => {
    const collectRef = collection(database, "chats");
    const q = query(collectRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("snapshot");
      setMessages(
        snapshot.docs.map((doc) => ({
          _id: doc.id,
          createdAt: doc.data().createdAt.toDate(),
          text: doc.data().text,
          user: doc.data().user,
        }))
      );
    });
    return () => unsubscribe();
  }, []);

  const ChatView = ({ messages, currentUser }) => {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          onContentSizeChange={handleContentSizeChange}
          contentContainerStyle={{ padding: 10 }}
        >
          {messages
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .map((message, index) => {
              const date = new Date(message.createdAt);
              const options = {
                hour12: true,
                hour: "numeric",
                minute: "numeric",
              };
              const formattedTime = date.toLocaleString("en-US", options);

              const isSameUser = message.user._id === currentUser;
              const isLastInGroup =
                index === messages.length - 1 ||
                messages[index + 1].user._id !== message.user._id;
              const isFirstInGroup =
                index === 0 ||
                messages[index - 1].user._id !== message.user._id;

              const messageStyles = [styles.message];
              const textStyles = [styles.messageText];

              if (isSameUser) {
                messageStyles.push(styles.sameUser);
              } else {
                messageStyles.push(styles.diffUser);
              }

              if (isFirstInGroup) {
                textStyles.push(styles.firstInGroup);
                messageStyles.push(styles.messageGroup);
              }

              if (isLastInGroup) {
                textStyles.push(styles.lastInGroup);
                messageStyles.push(styles.messageGroup);
              }

              return (
                <View key={message._id} style={messageStyles}>
                  {!isSameUser && isLastInGroup && (
                    <>
                      {/* <Image
                    source={{ uri: message.user.avatar }}
                    style={styles.avatar}
                  /> */}
                      <View
                        style={{
                          width: 30,
                          height: 30,
                          backgroundColor: "#ddd",
                          borderRadius: 30,
                          position: "absolute",
                          bottom: 10,
                        }}
                      />
                    </>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.messageContent,
                      {
                        maxWidth: "80%",
                      },
                    ]}
                  >
                    <View
                      style={[
                        textStyles,
                        {
                          backgroundColor: isSameUser ? "#222" : "#ddd",
                          borderTopRightRadius: !isSameUser
                            ? 20
                            : isSameUser && isFirstInGroup
                            ? 20
                            : 0,
                          borderBottomRightRadius: !isSameUser
                            ? 20
                            : isSameUser && isLastInGroup
                            ? 20
                            : 0,
                          borderTopLeftRadius:
                            !isSameUser && !isFirstInGroup ? 0 : 20,
                          borderBottomLeftRadius:
                            !isSameUser && !isLastInGroup ? 0 : 20,
                          marginVertical: 1,
                          marginLeft:
                            (!isSameUser && !isFirstInGroup) ||
                            (!isSameUser && !isLastInGroup) ||
                            !isSameUser
                              ? 35
                              : 0,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: isSameUser ? "#ddd" : "#222",
                          fontSize: 14,
                          lineHeight: 20,
                          // backgroundColor: "red",
                          // alignSelf: "flex-start",
                        }}
                      >
                        {message.text}
                      </Text>
                      <Text
                        style={{
                          color: isSameUser ? "#ddd" : "#222",
                          textAlign: isSameUser ? "right" : "left",
                          fontSize: 10,
                          opacity: 0.5,
                        }}
                      >
                        {formattedTime}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
        </ScrollView>
        <View
          style={{
            backgroundColor: "#ffffff",
            height: 90,
            paddingHorizontal: 40,
            paddingVertical: 10,
          }}
        >
          <TextInput
            placeholder="Type a message..."
            style={{
              backgroundColor: "#f2f2f2",
              borderRadius: 20,
              padding: 10,
            }}
          />
        </View>
      </View>
    );
  };

  return <ChatView messages={messages} currentUser={auth.currentUser.email} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  messageGroup: {
    flexDirection: "row",
    // alignItems: "flex-end",
  },
  sameUser: {
    alignSelf: "flex-end",
  },
  diffUser: {
    alignSelf: "flex-start",
  },
  message: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  messageContent: {
    // maxWidth: "90%",
  },
  messageText: {
    backgroundColor: "#f0f",
    padding: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    position: "absolute",
    bottom: 10,
  },
  firstInGroup: {},
  lastInGroup: {
    marginBottom: 10,
  },
});

export default CustomChat;

import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  ChatList: undefined;
  Chat: {
    chatId: string;
  };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 
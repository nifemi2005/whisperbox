export type EncryptedPayload = {
  ciphertext: string;
  iv: string;
  encryptedKey: string;
  encryptedKeyForSelf: string;
};

export type MessageResponse = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  payload: EncryptedPayload;
  delivered: boolean;
  created_at: string;
};

export type ConversationSummary = {
  user_id: string;
  display_name: string;
  username: string;
  last_message_at: string;
};

export type DecryptedMessage = {
    id: string              
    from_user_id: string    
    to_user_id: string      
    text: string
    created_at: string
    delivered: boolean
}
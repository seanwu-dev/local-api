import { gql } from 'apollo-server';

const messageSchema = gql`
  type Message {
    id: ID!
    userId: ID!
    timestamp: Float
    text: String!
    user: User!
  }

  extend type Query {
    messages(cursor: ID): [Message!]! # getMessages
    message(id: ID!): Message! # getMessage
  }

  extend type Mutation {
    createMessage(text: String!, userId: ID!): Message!
    updateMessage(id: ID!, text: String!, userId: ID!): Message!
    deleteMessage(id: ID!, userId: ID!): ID!
  }
`;

export default messageSchema;

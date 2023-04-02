import { gql } from "@apollo/client";

export const QUERY_BOOKS = gql`
  {
    books {
      _id
      username
      email
      bookCount
      savedBooks {
        bookId
        authors
        title
        description
        image
        link
      }
    }
  }

`
export type KeyValuePair = { [key: string]: any };

// internal shape of the post data
export type PostData = {
  metadata: PostMetadata;
  pages: PostComment[][];
}

export type StorageOptions = {
  session?: boolean;
  namespace?: string;
  compress?: boolean;
  decompress?: boolean;
}

export enum MessageType {
  RequestHeader
}

export type MessagePayload = {
  type: MessageType,
  payload?: any
}

export type ModalOptions = {
  title: string;
  message: string;
  action: () => void;
}

// LIHKG api response shape
export type Response = {
  success: number;
  server_time: number;
}

export type SuccessResponse<T = any> = {
  response: T
} & Response;

export type FailureResponse = {
  error_code: number;
  error_message: string;
} & Response;

// LIHKG API Payload shape
type PostMetadata = {
  thread_id: string;
  cat_id: number;
  sub_cat_id: number;
  title: string;
  user_id: string;
  user_nickname: string;
  user_gender: string;
  no_of_reply: number;
  no_of_uni_user_reply: number;
  like_count: number;
  dislike_count: number;
  reply_like_count: number;
  reply_dislike_count: number;
  max_reply_like_count: number;
  max_reply_dislike_count: number;
  create_time: number;
  last_reply_time: number;
  status: number;
  is_adu: boolean;
  remark: any;
  last_reply_user_id: number;
  first_post_id: string;
  max_reply: number;
  total_page: number;
  is_hot: boolean;
  category: Category;
  display_vote: boolean;
  vote_status: string;
  is_bookmarked: boolean;
  is_replied: boolean;
  user: User
}

export type PostPage = PostMetadata & {
  allow_create_child_thread: boolean;
  page: string;
  item_data: PostComment[]
  me?: any;
}

export type PostList = {
  category: Category;
  is_pagination: boolean;
  items: (PostMetadata & {
    sub_category?: SubCategory;
    is_highlight_sub_cat?: boolean;
  })[];
  me?: any;
}

type Category = {
  cat_id: string;
  name: string;
  postable: boolean;
}

type SubCategory = {
  sub_cat_id: string;
  cat_id: string;
  name: string;
  postable: boolean;
  filterable: boolean;
  is_highlight: boolean;
  orderable: boolean;
  is_filter: boolean;
  url: string;
  query: any;
}

type PostComment = {
  post_id: string;
  quote_post_id: string;
  thread_id: string;
  user_nickname: string;
  user_gender: string;
  like_count: number;
  dislike_count: number;
  vote_score: number;
  no_of_quote: number;
  remark: any
  status: number;
  reply_time: number;
  msg_num: number;
  msg: string;
  is_minimized_keywords: boolean;
  page: number;
  user: User;
  vote_status: string;
  display_vote: boolean;
  low_quality: boolean;
  quote?: Comment;
}

type User = {
  user_id: string
  nickname: string
  level: number
  gender: string
  status: number
  level_name: string
  is_following: boolean
  is_blocked: boolean
  is_disappear: boolean
  is_newbie: boolean
}

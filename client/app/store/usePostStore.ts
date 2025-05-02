import { create } from "zustand";
import { API_URL } from "../config/api";

interface Post {
  _id: string;
  userId: string;
  title: string;
  content: string;
  images: string[];
  likes: string[];
  comments: Comment[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface Comment {
  _id: string;
  userId: string;
  content: string;
  likes: string[];
  createdAt: Date;
}

interface PostStore {
  posts: Post[];
  currentPost: Post | null;
  isLoading: boolean;
  error: string | null;

  // Post actions
  fetchPosts: (page?: number, limit?: number) => Promise<void>;
  fetchPostById: (postId: string) => Promise<void>;
  createPost: (data: Partial<Post>) => Promise<void>;
  updatePost: (postId: string, data: Partial<Post>) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;

  // Like actions
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;

  // Comment actions
  addComment: (postId: string, content: string) => Promise<void>;
  deleteComment: (postId: string, commentId: string) => Promise<void>;
  likeComment: (postId: string, commentId: string) => Promise<void>;
  unlikeComment: (postId: string, commentId: string) => Promise<void>;
}

export const usePostStore = create<PostStore>((set, get) => ({
  posts: [],
  currentPost: null,
  isLoading: false,
  error: null,

  fetchPosts: async (page = 1, limit = 10) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(
        `${API_URL}/posts?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        set({ posts: data.data });
      } else {
        set({ error: data.message });
      }
    } catch (error) {
      set({ error: "Failed to fetch posts" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPostById: async (postId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        set({ currentPost: data.data });
      } else {
        set({ error: data.message });
      }
    } catch (error) {
      set({ error: "Failed to fetch post" });
    } finally {
      set({ isLoading: false });
    }
  },

  createPost: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (result.success) {
        set({ posts: [result.data, ...get().posts] });
      } else {
        set({ error: result.message });
      }
    } catch (error) {
      set({ error: "Failed to create post" });
    } finally {
      set({ isLoading: false });
    }
  },

  updatePost: async (postId, data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (result.success) {
        set({
          posts: get().posts.map((post) =>
            post._id === postId ? result.data : post
          ),
          currentPost: result.data,
        });
      } else {
        set({ error: result.message });
      }
    } catch (error) {
      set({ error: "Failed to update post" });
    } finally {
      set({ isLoading: false });
    }
  },

  deletePost: async (postId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        set({
          posts: get().posts.filter((post) => post._id !== postId),
          currentPost: null,
        });
      } else {
        set({ error: data.message });
      }
    } catch (error) {
      set({ error: "Failed to delete post" });
    } finally {
      set({ isLoading: false });
    }
  },

  likePost: async (postId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        const userId = data.data.userId;
        set({
          posts: get().posts.map((post) =>
            post._id === postId
              ? { ...post, likes: [...post.likes, userId] }
              : post
          ),
          currentPost:
            get().currentPost?._id === postId
              ? {
                  ...get().currentPost!,
                  likes: [...get().currentPost!.likes, userId],
                }
              : get().currentPost,
        });
      } else {
        set({ error: data.message });
      }
    } catch (error) {
      set({ error: "Failed to like post" });
    } finally {
      set({ isLoading: false });
    }
  },

  unlikePost: async (postId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`${API_URL}/posts/${postId}/unlike`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        const userId = data.data.userId;
        set({
          posts: get().posts.map((post) =>
            post._id === postId
              ? { ...post, likes: post.likes.filter((id) => id !== userId) }
              : post
          ),
          currentPost:
            get().currentPost?._id === postId
              ? {
                  ...get().currentPost!,
                  likes: get().currentPost!.likes.filter((id) => id !== userId),
                }
              : get().currentPost,
        });
      } else {
        set({ error: data.message });
      }
    } catch (error) {
      set({ error: "Failed to unlike post" });
    } finally {
      set({ isLoading: false });
    }
  },

  addComment: async (postId, content) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();

      if (data.success) {
        const newComment = data.data;
        set({
          posts: get().posts.map((post) =>
            post._id === postId
              ? { ...post, comments: [...post.comments, newComment] }
              : post
          ),
          currentPost:
            get().currentPost?._id === postId
              ? {
                  ...get().currentPost!,
                  comments: [...get().currentPost!.comments, newComment],
                }
              : get().currentPost,
        });
      } else {
        set({ error: data.message });
      }
    } catch (error) {
      set({ error: "Failed to add comment" });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteComment: async (postId, commentId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(
        `${API_URL}/posts/${postId}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        set({
          posts: get().posts.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  comments: post.comments.filter((c) => c._id !== commentId),
                }
              : post
          ),
          currentPost:
            get().currentPost?._id === postId
              ? {
                  ...get().currentPost!,
                  comments: get().currentPost!.comments.filter(
                    (c) => c._id !== commentId
                  ),
                }
              : get().currentPost,
        });
      } else {
        set({ error: data.message });
      }
    } catch (error) {
      set({ error: "Failed to delete comment" });
    } finally {
      set({ isLoading: false });
    }
  },

  likeComment: async (postId, commentId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(
        `${API_URL}/posts/${postId}/comments/${commentId}/like`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        const userId = data.data.userId;
        const updateComments = (comments: Comment[]) =>
          comments.map((comment) =>
            comment._id === commentId
              ? { ...comment, likes: [...comment.likes, userId] }
              : comment
          );

        set({
          posts: get().posts.map((post) =>
            post._id === postId
              ? { ...post, comments: updateComments(post.comments) }
              : post
          ),
          currentPost:
            get().currentPost?._id === postId
              ? {
                  ...get().currentPost!,
                  comments: updateComments(get().currentPost!.comments),
                }
              : get().currentPost,
        });
      } else {
        set({ error: data.message });
      }
    } catch (error) {
      set({ error: "Failed to like comment" });
    } finally {
      set({ isLoading: false });
    }
  },

  unlikeComment: async (postId, commentId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(
        `${API_URL}/posts/${postId}/comments/${commentId}/unlike`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        const userId = data.data.userId;
        const updateComments = (comments: Comment[]) =>
          comments.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  likes: comment.likes.filter((id) => id !== userId),
                }
              : comment
          );

        set({
          posts: get().posts.map((post) =>
            post._id === postId
              ? { ...post, comments: updateComments(post.comments) }
              : post
          ),
          currentPost:
            get().currentPost?._id === postId
              ? {
                  ...get().currentPost!,
                  comments: updateComments(get().currentPost!.comments),
                }
              : get().currentPost,
        });
      } else {
        set({ error: data.message });
      }
    } catch (error) {
      set({ error: "Failed to unlike comment" });
    } finally {
      set({ isLoading: false });
    }
  },
}));

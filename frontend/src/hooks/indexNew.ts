import { useEffect, useState } from "react"
import axios from "axios";
import { BACKEND_URL } from "../config";


export interface Blog {
    "content": string;
    "title": string;
    "id": number;
    "status"?: string;
    "coverImage"?: string;
    "authorId"?: number;
    "createdAt"?: string;
    "updatedAt"?: string;
    "media"?: Array<{
        id?: number;
        type: 'image' | 'video' | 'audio';
        url: string;
        caption?: string;
    }>;
    "author": {
        "name": string
    }
}

export const useBlog = ({ id }: { id: string }) => {
    const [loading, setLoading] = useState(true);
    const [blog, setBlog] = useState<Blog>();

    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/v1/blog/${id}`, {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        })
            .then(response => {
                setBlog(response.data.blog);
                setLoading(false);
            })
    }, [id])

    return {
        loading,
        blog
    }

}

export const useBlogs = () => {
    const [loading, setLoading] = useState(true);
    const [blogs, setBlogs] = useState<Blog[]>([]);

    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/v1/blog/bulk`, {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        })
            .then(response => {
                setBlogs(response.data.blogs);
                setLoading(false);
            })
    }, [])

    return {
        loading,
        blogs
    }
}

export const useUserPosts = () => {
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<Blog[]>([]);

    const fetchPosts = () => {
        setLoading(true);
        axios.get(`${BACKEND_URL}/api/v1/blog/user/posts`, {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        })
            .then(response => {
                setPosts(response.data.blogs);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching user posts:", error);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return {
        loading,
        posts,
        refetch: fetchPosts
    }
}

export const useSavedPosts = () => {
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<Blog[]>([]);

    const fetchSavedPosts = () => {
        setLoading(true);
        axios.get(`${BACKEND_URL}/api/v1/blog/user/saved`, {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        })
            .then(response => {
                setPosts(response.data.blogs);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching saved posts:", error);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchSavedPosts();
    }, []);

    return {
        loading,
        posts,
        refetch: fetchSavedPosts
    }
}

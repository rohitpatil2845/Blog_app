import { useState } from "react";
import { Appbar } from "../component/Appbar";
import { useNavigate } from "react-router-dom";
import { useUserPosts } from "../hooks";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Trash2, Edit, Eye, FileText, Clock, CheckCircle } from "lucide-react";

export const MyPosts = () => {
    const { loading, posts, refetch } = useUserPosts();
    const navigate = useNavigate();
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`${BACKEND_URL}/api/v1/blog/${id}`, {
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            });
            refetch();
            setDeleteConfirm(null);
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("Failed to delete post");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle size={14} /> Published
                </span>;
            case 'draft':
                return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Clock size={14} /> Draft
                </span>;
            default:
                return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <FileText size={14} /> {status}
                </span>;
        }
    };

    if (loading) {
        return (
            <div>
                <Appbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Appbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Posts</h1>
                    <p className="mt-2 text-gray-600">Manage all your blog posts</p>
                </div>

                {posts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No posts yet</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating a new post.</p>
                        <button
                            onClick={() => navigate("/publish")}
                            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Create Post
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {posts.map(post => (
                            <div key={post.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-xl font-bold text-gray-900 hover:text-blue-600 cursor-pointer"
                                                onClick={() => navigate(`/blog/${post.id}`)}>
                                                {post.title}
                                            </h2>
                                            {getStatusBadge(post.status)}
                                        </div>
                                        <p className="text-gray-600 line-clamp-2 mb-3">
                                            {post.content.substring(0, 150)}...
                                        </p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>Created: {new Date(post.createdAt).toLocaleDateString()}</span>
                                            <span>Updated: {new Date(post.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <button
                                            onClick={() => navigate(`/blog/${post.id}`)}
                                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="View"
                                        >
                                            <Eye size={20} />
                                        </button>
                                        <button
                                            onClick={() => navigate(`/edit/${post.id}`)}
                                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit size={20} />
                                        </button>
                                        {deleteConfirm === post.id ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleDelete(post.id)}
                                                    className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                                >
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(null)}
                                                    className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setDeleteConfirm(post.id)}
                                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

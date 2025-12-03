import { Appbar } from "../component/Appbar";
import { useNavigate } from "react-router-dom";
import { useSavedPosts } from "../hooks";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Bookmark, BookmarkX } from "lucide-react";

export const SavedPosts = () => {
    const { loading, posts, refetch } = useSavedPosts();
    const navigate = useNavigate();

    const handleUnsave = async (id: number) => {
        try {
            await axios.delete(`${BACKEND_URL}/api/v1/blog/${id}/save`, {
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            });
            refetch();
        } catch (error) {
            console.error("Error unsaving post:", error);
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
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Bookmark className="text-blue-600" size={32} />
                        Saved Posts
                    </h1>
                    <p className="mt-2 text-gray-600">Posts you've bookmarked for later</p>
                </div>

                {posts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                        <Bookmark className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No saved posts</h3>
                        <p className="mt-1 text-sm text-gray-500">Start bookmarking posts you want to read later.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {posts.map(post => (
                            <div key={post.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden">
                                {post.coverImage && (
                                    <img 
                                        src={post.coverImage} 
                                        alt={post.title}
                                        className="w-full h-48 object-cover"
                                    />
                                )}
                                <div className="p-5">
                                    <h2 
                                        className="text-lg font-bold text-gray-900 hover:text-blue-600 cursor-pointer mb-2 line-clamp-2"
                                        onClick={() => navigate(`/blog/${post.id}`)}
                                    >
                                        {post.title}
                                    </h2>
                                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                                        {post.content.substring(0, 120)}...
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-500">
                                            <span>By {post.author.name}</span>
                                        </div>
                                        <button
                                            onClick={() => handleUnsave(post.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remove from saved"
                                        >
                                            <BookmarkX size={20} />
                                        </button>
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

import { Appbar } from "./Appbar"
import { Avatar } from "./BlogCard"
import type { Blog } from "../hooks"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { BACKEND_URL } from "../config"
import { Edit, Bookmark, BookmarkCheck, Trash2 } from "lucide-react"

export const FullBlog = ({ blog }: {blog: Blog}) => {
    const navigate = useNavigate();
    const [isSaved, setIsSaved] = useState(false);
    const [isAuthor, setIsAuthor] = useState(false);

    useEffect(() => {
        // Check if user is the author
        const token = localStorage.getItem("token");
        if (token) {
            axios.get(`${BACKEND_URL}/api/v1/user/me`, {
                headers: { Authorization: token }
            })
            .then(response => {
                setIsAuthor(response.data.user.id === blog.authorId);
            })
            .catch(() => {});

            // Check if post is saved
            axios.get(`${BACKEND_URL}/api/v1/blog/${blog.id}/is-saved`, {
                headers: { Authorization: token }
            })
            .then(response => {
                setIsSaved(response.data.isSaved);
            })
            .catch(() => {});
        }
    }, [blog.id, blog.authorId]);

    const handleSave = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/signin");
            return;
        }

        try {
            if (isSaved) {
                await axios.delete(`${BACKEND_URL}/api/v1/blog/${blog.id}/save`, {
                    headers: { Authorization: token }
                });
                setIsSaved(false);
            } else {
                await axios.post(`${BACKEND_URL}/api/v1/blog/${blog.id}/save`, {}, {
                    headers: { Authorization: token }
                });
                setIsSaved(true);
            }
        } catch (error) {
            console.error("Error toggling save:", error);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        
        try {
            await axios.delete(`${BACKEND_URL}/api/v1/blog/${blog.id}`, {
                headers: { Authorization: localStorage.getItem("token") }
            });
            navigate("/my-posts");
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("Failed to delete post");
        }
    };

    return <div>
        <Appbar />
        <div className="flex justify-center bg-gray-50 min-h-screen">
            <div className="max-w-screen-xl w-full px-4 sm:px-6 lg:px-10 py-8">
                {/* Cover Image */}
                {blog.coverImage && (
                    <img 
                        src={blog.coverImage} 
                        alt={blog.title}
                        className="w-full h-96 object-cover rounded-xl mb-8 shadow-lg"
                    />
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-lg shadow-sm p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="text-5xl font-extrabold text-gray-900 leading-tight">
                                    {blog.title}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSave}
                                        className={`p-2 rounded-lg transition-colors ${
                                            isSaved 
                                                ? 'bg-blue-100 text-blue-600' 
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                        title={isSaved ? "Remove from saved" : "Save post"}
                                    >
                                        {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                                    </button>
                                    {isAuthor && (
                                        <>
                                            <button
                                                onClick={() => navigate(`/edit-post/${blog.id}`)}
                                                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                                title="Edit post"
                                            >
                                                <Edit size={20} />
                                            </button>
                                            <button
                                                onClick={handleDelete}
                                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                title="Delete post"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-slate-500 text-sm mb-8 pb-6 border-b">
                                <span>By {blog.author.name || "Anonymous"}</span>
                                <span>•</span>
                                <span>{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown date'}</span>
                                {blog.status && blog.status !== 'published' && (
                                    <>
                                        <span>•</span>
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                                            {blog.status.toUpperCase()}
                                        </span>
                                    </>
                                )}
                            </div>
                            
                            <div className="prose max-w-none text-gray-700 text-lg leading-relaxed whitespace-pre-wrap mb-8">
                                {blog.content}
                            </div>

                            {/* Media Attachments */}
                            {blog.media && blog.media.length > 0 && (
                                <div className="mt-8 border-t pt-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Attachments</h3>
                                    <div className="space-y-4">
                                        {blog.media.map((item, index) => (
                                            <div key={index} className="border rounded-lg p-4">
                                                {item.type === 'image' && (
                                                    <img src={item.url} alt={item.caption || "Media"} className="w-full rounded-lg" />
                                                )}
                                                {item.type === 'video' && (
                                                    <video controls className="w-full rounded-lg">
                                                        <source src={item.url} />
                                                    </video>
                                                )}
                                                {item.type === 'audio' && (
                                                    <audio controls className="w-full">
                                                        <source src={item.url} />
                                                    </audio>
                                                )}
                                                {item.caption && (
                                                    <p className="mt-2 text-sm text-gray-600 italic">{item.caption}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Author Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
                            <div className="text-slate-600 text-sm font-semibold uppercase tracking-wide mb-4">
                                About the Author
                            </div>
                            <div className="flex items-start gap-4">
                                <Avatar size="big" name={blog.author.name || "Anonymous"} />
                                <div className="flex-1">
                                    <div className="text-xl font-bold text-gray-900 mb-2">
                                        {blog.author.name || "Anonymous"}
                                    </div>
                                    {blog.author.email && (
                                        <div className="text-sm text-gray-600 mb-3">
                                            {blog.author.email}
                                        </div>
                                    )}
                                    <div className="text-slate-500 text-sm leading-relaxed">
                                        Random catch phrase about the author's ability to grab the user's attention
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}
import { Appbar } from "./Appbar"
import { Avatar } from "./BlogCard"
import type { Blog } from "../hooks"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Edit, Trash2, Bookmark, BookmarkCheck } from "lucide-react"
import axios from "axios"
import { BACKEND_URL } from "../config"

export const FullBlogNew = ({ blog }: {blog: Blog}) => {
    const navigate = useNavigate();
    const [isAuthor, setIsAuthor] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    useEffect(() => {
        const checkAuthorAndSaved = async () => {
            try {
                const token = localStorage.getItem("token");
                if (token) {
                    // Check if current user is the author
                    const userResponse = await axios.get(`${BACKEND_URL}/api/v1/user/me`, {
                        headers: { Authorization: token }
                    });
                    setIsAuthor(userResponse.data.user.id === blog.authorId);

                    // Check if post is saved
                    const savedResponse = await axios.get(`${BACKEND_URL}/api/v1/blog/${blog.id}/is-saved`, {
                        headers: { Authorization: token }
                    });
                    setIsSaved(savedResponse.data.isSaved);
                }
            } catch (error) {
                console.error("Error checking auth:", error);
            }
        };
        checkAuthorAndSaved();
    }, [blog.id, blog.authorId]);

    const handleDelete = async () => {
        try {
            await axios.delete(`${BACKEND_URL}/api/v1/blog/${blog.id}`, {
                headers: { Authorization: localStorage.getItem("token") }
            });
            navigate("/blogs");
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("Failed to delete post");
        }
    };

    const handleSaveToggle = async () => {
        try {
            if (isSaved) {
                await axios.delete(`${BACKEND_URL}/api/v1/blog/${blog.id}/save`, {
                    headers: { Authorization: localStorage.getItem("token") }
                });
            } else {
                await axios.post(`${BACKEND_URL}/api/v1/blog/${blog.id}/save`, {}, {
                    headers: { Authorization: localStorage.getItem("token") }
                });
            }
            setIsSaved(!isSaved);
        } catch (error) {
            console.error("Error toggling save:", error);
        }
    };

    return <div>
        <Appbar />
        <div className="flex justify-center bg-gray-50 min-h-screen">
            <div className="grid grid-cols-12 px-4 sm:px-6 lg:px-10 w-full max-w-screen-xl pt-12 gap-8">
                <div className="col-span-12 lg:col-span-8">
                    <article className="bg-white rounded-lg shadow-sm p-6 lg:p-8">
                        {/* Action Buttons */}
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex gap-2">
                                {isAuthor && (
                                    <>
                                        <button
                                            onClick={() => navigate(`/edit/${blog.id}`)}
                                            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Edit size={16} />
                                            Edit
                                        </button>
                                        {deleteConfirm ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleDelete}
                                                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                                                >
                                                    Confirm Delete
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(false)}
                                                    className="px-4 py-2 text-sm bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setDeleteConfirm(true)}
                                                className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                                Delete
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                            <button
                                onClick={handleSaveToggle}
                                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                                    isSaved 
                                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                                {isSaved ? 'Saved' : 'Save'}
                            </button>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
                            {blog.title}
                        </h1>
                        
                        {/* Meta Info */}
                        <div className="text-slate-500 pt-2 pb-6 border-b border-gray-200">
                            Posted on {new Date(blog.createdAt || new Date()).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </div>

                        {/* Cover Image */}
                        {blog.coverImage && (
                            <img 
                                src={blog.coverImage} 
                                alt={blog.title}
                                className="w-full rounded-lg my-6"
                            />
                        )}
                        
                        {/* Content */}
                        <div className="pt-6 text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                            {blog.content}
                        </div>

                        {/* Media Gallery */}
                        {blog.media && blog.media.length > 0 && (
                            <div className="mt-8 space-y-6">
                                <h2 className="text-2xl font-bold text-gray-900">Media</h2>
                                {blog.media.map((item, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        {item.type === 'image' && (
                                            <img src={item.url} alt={item.caption || 'Media'} className="w-full rounded-lg" />
                                        )}
                                        {item.type === 'video' && (
                                            <video controls className="w-full rounded-lg">
                                                <source src={item.url} />
                                                Your browser does not support the video tag.
                                            </video>
                                        )}
                                        {item.type === 'audio' && (
                                            <audio controls className="w-full">
                                                <source src={item.url} />
                                                Your browser does not support the audio tag.
                                            </audio>
                                        )}
                                        {item.caption && (
                                            <p className="mt-2 text-sm text-gray-600 italic">{item.caption}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </article>
                </div>
                
                {/* Author Sidebar */}
                <div className="col-span-12 lg:col-span-4">
                    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                        <div className="text-slate-600 text-lg mb-4">
                            Author
                        </div>
                        <div className="flex items-start gap-4">
                            <Avatar size="big" name={blog.author.name || "Anonymous"} />
                            <div className="flex-1">
                                <div className="text-xl font-bold text-gray-900">
                                    {blog.author.name || "Anonymous"}
                                </div>
                                <div className="pt-2 text-slate-500 text-sm">
                                    Passionate writer sharing insights and stories with the world.
                                </div>
                            </div>
                        </div>  
                    </div>
                </div>
            </div>
        </div>
    </div>
}

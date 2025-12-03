import axios from "axios";
import { BACKEND_URL } from "../config";
import { useNavigate, useParams } from "react-router-dom";
import { useState, type ChangeEvent, useEffect } from "react";
import { Appbar } from "../component/Appbar";
import { useBlog } from "../hooks";
import { Image, Video, Music, Upload, X, Save } from "lucide-react";

interface MediaItem {
    type: 'image' | 'video' | 'audio';
    url: string;
    caption?: string;
}

export const EditPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { loading, blog } = useBlog({ id: id || "" });
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [coverImage, setCoverImage] = useState("");
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [status, setStatus] = useState<'draft' | 'published'>('draft');
    const [mediaUrl, setMediaUrl] = useState("");
    const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio'>('image');
    const [mediaCaption, setMediaCaption] = useState("");

    useEffect(() => {
        if (blog) {
            setTitle(blog.title);
            setDescription(blog.content);
            setCoverImage(blog.coverImage || "");
            setMedia(blog.media || []);
            setStatus(blog.status || 'draft');
        }
    }, [blog]);

    const addMedia = () => {
        if (mediaUrl) {
            setMedia([...media, { type: mediaType, url: mediaUrl, caption: mediaCaption }]);
            setMediaUrl("");
            setMediaCaption("");
        }
    };

    const removeMedia = (index: number) => {
        setMedia(media.filter((_, i) => i !== index));
    };

    const handleSave = async (publishStatus: 'draft' | 'published') => {
        try {
            const response = await axios.put(`${BACKEND_URL}/api/v1/blog`, {
                id,
                title,
                content: description,
                coverImage,
                media,
                status: publishStatus
            }, {
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            });
            navigate(`/blog/${id}`);
        } catch (error) {
            console.error("Error updating post:", error);
            alert("Failed to update post");
        }
    };

    if (loading) {
        return (
            <div>
                <Appbar />
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Appbar />
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Post</h1>
                    
                    {/* Title */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                            onChange={(e) => setTitle(e.target.value)}
                            value={title}
                            type="text"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your post title..."
                        />
                    </div>

                    {/* Cover Image */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image URL</label>
                        <input
                            onChange={(e) => setCoverImage(e.target.value)}
                            value={coverImage}
                            type="text"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://example.com/image.jpg"
                        />
                        {coverImage && (
                            <img src={coverImage} alt="Cover preview" className="mt-3 max-h-48 rounded-lg" />
                        )}
                    </div>

                    {/* Content */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                        <textarea
                            onChange={(e) => setDescription(e.target.value)}
                            value={description}
                            rows={12}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Write your story..."
                        />
                    </div>

                    {/* Media Section */}
                    <div className="mb-6 p-6 bg-gray-50 rounded-lg">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Media</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Media Type</label>
                                <select
                                    value={mediaType}
                                    onChange={(e) => setMediaType(e.target.value as 'image' | 'video' | 'audio')}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="image">Image</option>
                                    <option value="video">Video</option>
                                    <option value="audio">Audio</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Media URL</label>
                                <input
                                    value={mediaUrl}
                                    onChange={(e) => setMediaUrl(e.target.value)}
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://example.com/media.jpg"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Caption (optional)</label>
                            <input
                                value={mediaCaption}
                                onChange={(e) => setMediaCaption(e.target.value)}
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Add a caption..."
                            />
                        </div>

                        <button
                            onClick={addMedia}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Upload size={18} />
                            Add Media
                        </button>

                        {/* Media Preview */}
                        {media.length > 0 && (
                            <div className="mt-6 space-y-3">
                                <h3 className="text-sm font-medium text-gray-700">Attached Media</h3>
                                {media.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                        {item.type === 'image' && <Image className="text-blue-600" size={20} />}
                                        {item.type === 'video' && <Video className="text-red-600" size={20} />}
                                        {item.type === 'audio' && <Music className="text-green-600" size={20} />}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{item.url}</p>
                                            {item.caption && <p className="text-xs text-gray-500">{item.caption}</p>}
                                        </div>
                                        <button
                                            onClick={() => removeMedia(index)}
                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleSave('draft')}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <Save size={18} />
                            Save as Draft
                        </button>
                        <button
                            onClick={() => handleSave('published')}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Update & Publish
                        </button>
                        <button
                            onClick={() => navigate(`/blog/${id}`)}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

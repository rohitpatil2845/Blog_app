import axios from "axios";
import { BACKEND_URL } from "../config";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Appbar } from "../component/Appbar";
import { Image, Video, Music, Upload, X } from "lucide-react";

interface MediaItem {
    type: 'image' | 'video' | 'audio';
    url: string;
    caption?: string;
}

export const Publish = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [coverImage, setCoverImage] = useState("");
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [mediaUrl, setMediaUrl] = useState("");
    const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio'>('image');
    const [mediaCaption, setMediaCaption] = useState("");
    const [showMediaForm, setShowMediaForm] = useState(false);
    const navigate = useNavigate();

    const addMedia = () => {
        if (mediaUrl) {
            setMedia([...media, { type: mediaType, url: mediaUrl, caption: mediaCaption }]);
            setMediaUrl("");
            setMediaCaption("");
            setShowMediaForm(false);
        }
    };

    const removeMedia = (index: number) => {
        setMedia(media.filter((_, i) => i !== index));
    };

    const handlePublish = async (status: 'draft' | 'published' | 'private') => {
        try {
            const response = await axios.post(`${BACKEND_URL}/api/v1/blog`, {
                title,
                content: description,
                coverImage: coverImage || null,
                media,
                status
            }, {
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            });
            navigate(`/blog/${response.data.id}`);
        } catch (error) {
            console.error("Error creating post:", error);
            alert("Failed to create post");
        }
    };

    return <div className="min-h-screen bg-gray-50">
        <Appbar />
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-sm p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Post</h1>
                
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image URL (optional)</label>
                    <input 
                        onChange={(e) => setCoverImage(e.target.value)}
                        value={coverImage}
                        type="text" 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        placeholder="https://example.com/image.jpg" 
                    />
                    {coverImage && (
                        <img src={coverImage} alt="Cover preview" className="mt-3 rounded-lg max-h-48 object-cover" />
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
                        placeholder="Write your article..." 
                    />
                </div>

                {/* Media Section */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">Media Attachments</label>
                        <button
                            onClick={() => setShowMediaForm(!showMediaForm)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                            <Upload size={16} />
                            Add Media
                        </button>
                    </div>

                    {showMediaForm && (
                        <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                                    <select 
                                        value={mediaType}
                                        onChange={(e) => setMediaType(e.target.value as 'image' | 'video' | 'audio')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    >
                                        <option value="image">📷 Image</option>
                                        <option value="video">🎥 Video</option>
                                        <option value="audio">🎵 Audio</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">URL</label>
                                    <input 
                                        value={mediaUrl}
                                        onChange={(e) => setMediaUrl(e.target.value)}
                                        type="text" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                                        placeholder="https://..." 
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Caption (optional)</label>
                                <input 
                                    value={mediaCaption}
                                    onChange={(e) => setMediaCaption(e.target.value)}
                                    type="text" 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                                    placeholder="Add a caption..." 
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={addMedia}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                                >
                                    Add Media
                                </button>
                                <button
                                    onClick={() => setShowMediaForm(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Media List */}
                    {media.length > 0 && (
                        <div className="space-y-2">
                            {media.map((item, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <span className="text-lg">
                                        {item.type === 'image' && '📷'}
                                        {item.type === 'video' && '🎥'}
                                        {item.type === 'audio' && '🎵'}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{item.url}</p>
                                        {item.caption && <p className="text-xs text-gray-500">{item.caption}</p>}
                                    </div>
                                    <button
                                        onClick={() => removeMedia(index)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                    <button 
                        onClick={() => handlePublish('published')}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                        ✅ Publish Now
                    </button>
                    <button 
                        onClick={() => handlePublish('draft')}
                        className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                    >
                        📝 Save as Draft
                    </button>
                    <button 
                        onClick={() => handlePublish('private')}
                        className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                    >
                        🔒 Save as Private
                    </button>
                </div>
            </div>
        </div>
    </div>
}


function TextEditor({ onChange }: {onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void}) {
    return <div className="mt-2">
        <div className="w-full mb-4 ">
            <div className="flex items-center justify-between border">
            <div className="my-2 bg-white rounded-b-lg w-full">
                <label className="sr-only">Publish post</label>
                <textarea onChange={onChange} id="editor" rows={8} className="focus:outline-none block w-full px-0 text-sm text-gray-800 bg-white border-0 pl-2" placeholder="Write an article..." required />
            </div>
        </div>
       </div>
    </div>
    
}
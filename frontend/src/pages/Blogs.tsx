
import { Appbar } from "../component/Appbar";
import { BlogCard } from "../component/BlogCard";
import { BlogSkeleton } from "../component/BlogSkeleton";
import { useBlogs } from "../hooks";

export const Blogs = () => {
    const { loading, blogs } = useBlogs();

    if (loading) {
        return <div>
            <Appbar /> 
            <div  className="flex justify-center">
                <div>
                    <BlogSkeleton />
                    <BlogSkeleton />
                    <BlogSkeleton />
                    <BlogSkeleton />
                    <BlogSkeleton />
                </div>
            </div>
        </div>
    }

    return <div>
        <Appbar />
        <div  className="flex justify-center">
            <div>
                {blogs.map(blog => <BlogCard
                    key={blog.id}
                    id={blog.id}
                    authorName={blog.author.name || "Anonymous"}
                    title={blog.title}
                    content={blog.content}
                    publishedDate={blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "Unknown date"}
                />)}
            </div>
        </div>
    </div>
}

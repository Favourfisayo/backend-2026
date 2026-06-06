const posts = [
    {id: 1, title: "post 1"},
    {id: 2, title: "post 2"}
]

 function getPosts() {
    return posts
}

function getPost(id) {
    const post = posts.find(post => post.id === id)
    return post
}

export default getPosts
export {getPost}
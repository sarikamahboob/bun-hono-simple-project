import { Hono } from "hono";
import { stream, streamText } from "hono/streaming";
import { v4 as uuid4 } from "uuid";

const app = new Hono()

app.get("/", (c) => {
    return c.html("<h1>Welcome to hono crash course</h1>")
})

let videos = []

app.post("/video", async(c) => {
    const {videoName, channleName, duration} = await c.req.json()
    const newVideo = {
        id: uuid4(),
        videoName,
        channleName,
        duration
    }
    videos.push(newVideo)
    return c.json(newVideo)
})

// read all (using stream)
app.get("/videos", (c) => {
    return streamText(c, async(stream) => {
        for ( const video of videos ){
            await stream.writeln(JSON.stringify(video))
            await stream.sleep(1000)
        }
    })
})

// read by id
app.get("/video/:id", (c) => {
    const { id } =  c.req.param()
    const video = videos.find((video) => video.id === id)
    if(!video){
        return c.json({ messge: "video not found" }, 404)
    }
    return c.json(video)
})


// update by id
app.put("/video/:id", async (c) => {
    const { id } =  c.req.param()
    const index = videos.findIndex((video) => video.id === id)
    if(index === -1){
        return c.json({ messge: "video not found" }, 404)
    }
    const { videoName, channleName, duration } = await c.req.json()
    videos[index] = {
        ...videos[index],
        videoName,
        channleName,
        duration
    }
    return c.json(videos[index])
})

// delete by id
app.delete("/video/:id", (c)=> {
    const { id } = c.req.param()
    const video = videos.filter((video) => video.id !== id)
    return c.json({message: "video deleted"})
})

// delete all videos
app.delete("/videos", (c) => {
    videos = []
    return c.json({message: "all videos deleted"})
})


export default app;
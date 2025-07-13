import { Hono } from 'hono'
import { poweredBy } from "hono/powered-by"
import { logger } from "hono/logger"
import dbConnect from './db/connect'
import FavYoutubeVideoModel from './db/fav-youtube-model'
import { isValidObjectId } from 'mongoose'
import { stream, streamText } from "hono/streaming";

const app = new Hono()

//middlewares
app.use(poweredBy())
app.use(logger())

dbConnect()
  .then(()=> {
    // get list
    app.get("/", async(c) => {
      const videos = await FavYoutubeVideoModel.find()
      return c.json(
        videos.map((d) => d.toObject()),
        200
      )
    })
    // create document
    app.post("/", async(c) => {
      const data = await c.req.json()
      if(!data.thumbnailUrl) delete data.thumbnailUrl; 
      const favYoutubeVideosObj = new FavYoutubeVideoModel(data)
      try {
        const document = await favYoutubeVideosObj.save()
        return c.json(document.toObject(), 201)
      } catch (error) {
        return c.json(
          (error as any)?.message || "Internal Server Error",
          500
        )
      }
    })
    // get document by id
    app.get("/:documentId", async (c)=> {
      const id = c.req.param("documentId")
      if(!isValidObjectId(id)) return c.json("Invalid ID", 400)
      const document = await FavYoutubeVideoModel.findById(id)
      if(!document) return c.json("Document not found", 404)
      return c.json(document.toObject(), 200)
    })
    app.get("/d/:documentId", async (c) => {
      const { documentId } = c.req.param()
      if(!isValidObjectId(documentId)) return c.json("Invalid ID", 400)
      const document = await FavYoutubeVideoModel.findById(documentId)
      if(!document) return c.json("Document not found", 404)
      return streamText(c, async(stream) => {
        stream.onAbort(() => {
          console.log("Aborted!")
        })
        for (let i = 0; i < document.description.length; i++) {
          await stream.write(document.description[i])
          await stream.sleep(1000)
        }
      })  
    }) 
    app.patch("/:documentId", async (c) => {
      const { documentId } = c.req.param()
      if(!isValidObjectId(documentId)) return c.json("Invalid ID", 400)

      const document = await FavYoutubeVideoModel.findById(documentId)
      if(!document) return c.json("Document not found", 404)

      const formData = await c.req.json()
      if(!formData.thumbnailUrl) delete formData.thumbnailUrl

      try {
        const udpatedDocument = await FavYoutubeVideoModel.findByIdAndUpdate(
          documentId,
          formData,
          {
            new: true
          }
        )
        return c.json(udpatedDocument?.toObject(), 200)
      } catch (error) {
        return c.json(
          (error as any)?.message || "Internal Server Error",
          500
        )
      }
    })
    app.delete("/:documentId", async (c) => {
      const { documentId } = c.req.param()
      if(!isValidObjectId(documentId)) return c.json("Invalid ID", 400)
      
      try {
        const deletedDocument = await FavYoutubeVideoModel.findByIdAndDelete(documentId)
        return c.json(deletedDocument?.toObject(), 200)
      } catch (error) {
        return c.json(
          (error as any)?.message || "Internal Server Error",
          500
        )
      }
      
    })
  })
  .catch((err)=> {
    app.get('/*', (c) => {
      return c.text ( `Failed to cinnect MongoDB: ${err.message}`)
    })
  })

app.onError((err, c) => {
  return c.text(`App Error: ${err.message}`)
})

// app.get('/', (c) => {
//   return c.html('<h1>Hello Hono!</h1>')
// })

export default app

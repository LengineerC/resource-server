import { BASE_URL } from "./ip";
import { v4 as uuidv4 } from "uuid";

export default async function streamUpload(uploadUrl:string,completeUrl:string,file:File,toPath:string){
    try{
        const uploadResponseUrl=(BASE_URL[BASE_URL.length-1]==='/'?
            BASE_URL.substring(0,BASE_URL.length-1):
            BASE_URL)
            +uploadUrl;
        const uploadId=uuidv4();
        const chunkSize=1024*1024; // 1MB
        let offset=0;
        let chunkIndex = 0;

        while(offset<file.size){
            // console.log("start send chunk:",Math.floor(offset/chunkSize));
            const chunk=file.slice(offset,offset+chunkSize);

            const params = new URLSearchParams({
                uploadId,
                fileName: file.name,
                chunkIndex: chunkIndex.toString()
            });
            
            // const formData=new FormData();
            // formData.append("file",chunk);
            // formData.append("uploadId",uploadId);
            // formData.append("fileName",file.name);
            // formData.append("totalSize",file.size.toString());
            // formData.append("chunkIndex",Math.floor(offset/chunkSize).toString());

            const response=await fetch(`${uploadResponseUrl}?${params.toString()}`,{
                method:"POST",
                headers: {
                    "Content-Type": "application/octet-stream"
                  },
                body: chunk
            });

            if (!response.ok) throw new Error('Chunk upload failed');

            chunkIndex++;
            offset += chunkSize;
        }

        const completeResponseUrl=(BASE_URL[BASE_URL.length-1]==='/'?
            BASE_URL.substring(0,BASE_URL.length-1):
            BASE_URL)
            +completeUrl;

        const response=await fetch(`${completeResponseUrl}/${uploadId}`,{
            method:"POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body:JSON.stringify({
                fileName:file.name,
                toPath
            })
        });
        if (!response.ok) throw new Error('Finalization failed');

        return response.json();
    }catch(err){
        console.error('Upload failed:', err);
        throw err;
    }
}
from youtube_transcript_api import YouTubeTranscriptApi
import time
import yt_dlp
import json

def get_video_info(video_id):    
    url = f"https://www.youtube.com/watch?v={video_id}"

    ydl_opts = {
        'quiet': True,
        'skip_download': True,
        'forcejson': True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)

    vid_info={
        "title": info.get("title"),        
        "upload_date": info.get("upload_date"),
        "duration": info.get("duration"),
        "view_count": info.get("view_count"),
        "like_count": info.get("like_count"),
        "tags": info.get("tags"),
        "description": info.get("description"),
        "thumbnail": info.get("thumbnail"),
    }
    return vid_info

with open('urls.txt','r',encoding='utf-8') as file:
    urls=file.readlines()
    urls=[url.strip() for url in urls]

for index,url in enumerate(urls,start=1):
    found=False
    video_id = url[::-1][0:11][::-1] 
    print(f'trying for: {video_id} {index}/{len(urls)}')   
    while not found:
        try:
            transcript_data = YouTubeTranscriptApi.get_transcript(video_id)
            found=True
        except Exception as e:
            print(f'error! trying again {index}/{len(urls)}')
            time.sleep(3)          
    video_data={
        'metadata':get_video_info(video_id),
        'transcript_data':transcript_data
    }
    with open(f'data/{index}.json','w',encoding='utf-8') as file:
        json.dump(video_data,file,indent=2)
    print(f'success! {index}/{len(urls)}')
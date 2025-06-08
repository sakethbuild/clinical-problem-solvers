import yt_dlp

playlist_url = "https://www.youtube.com/playlist?list=PL5y5chCwiBxFaxfvIT4hhYmiNdgoEWLlb"  # Replace with your playlist URL

ydl_opts = {
    'quiet': True,
    'extract_flat': True,
}

with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    info = ydl.extract_info(playlist_url, download=False)

print(f"Playlist Title: {info.get('title')}")
print(f"Number of videos in playlist: {len(info.get('entries', []))}")

urls = [entry.get('url') for entry in info.get('entries', [])]
for url in urls:
    print(url)

with open("urls.txt", "w", encoding="utf-8") as f:
    for url in urls:
        f.write(url + "\n")

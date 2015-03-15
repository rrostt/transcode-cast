# chromecast media server

Requires ffmpeg and ffprobe

Can either be used to start standalone media files from rar archives, or run as a web server from which videos can be started from a web site.

Start web server using 'node server.js /path/to/media'.

Cast a video using 'node startTranscoder.js /path/to/rar'.

It will transcode media directly from rar archives to nearest Chromecast.

(c) Mattias Rost 2015, http://rost.me


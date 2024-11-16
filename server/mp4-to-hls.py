import os
import subprocess

# Thư mục gốc (thư mục hiện tại chứa script)
base_dir = os.path.dirname(os.path.abspath(__file__))

# Thư mục chứa các file video gốc (đường dẫn tương đối)
input_folder = os.path.join(base_dir, "video")

# Thư mục chứa output HLS (đường dẫn tương đối)
output_folder = os.path.join(base_dir, "public")

# Tạo thư mục output nếu chưa tồn tại
if not os.path.exists(output_folder):
    os.makedirs(output_folder)

# Lặp qua tất cả các file trong thư mục input
for file in os.listdir(input_folder):
    if file.endswith(".MOV") or file.endswith(".mp4"):  # Kiểm tra định dạng video
        input_file_path = os.path.join(input_folder, file)
        file_name, _ = os.path.splitext(file)
        output_path = os.path.join(output_folder, file_name)

        # Kiểm tra nếu thư mục đã tồn tại
        if os.path.exists(output_path):
            print(f"Bỏ qua: Thư mục '{output_path}' đã tồn tại. Không xử lý file '{file}'.")
            continue  # Bỏ qua file hiện tại và chuyển sang file tiếp theo

        # Tạo thư mục con cho mỗi video
        os.makedirs(output_path)

        # Tạo lệnh FFmpeg
        command = [
            "ffmpeg",
            "-i", input_file_path,
            "-map", "0:v:0", "-map", "0:a:0",
            "-s:v:0", "256x144", "-c:v:0", "libx264", "-b:v:0", "400k", "-maxrate:v:0", "450k", "-bufsize:v:0", "600k",
            "-map", "0:v:0", "-map", "0:a:0",
            "-s:v:1", "640x360", "-c:v:1", "libx264", "-b:v:1", "800k", "-maxrate:v:1", "850k", "-bufsize:v:1", "1200k",
            "-map", "0:v:0", "-map", "0:a:0",
            "-s:v:2", "854x480", "-c:v:2", "libx264", "-b:v:2", "1200k", "-maxrate:v:2", "1280k", "-bufsize:v:2", "1600k",
            "-map", "0:v:0", "-map", "0:a:0",
            "-s:v:3", "1280x720", "-c:v:3", "libx264", "-b:v:3", "2800k", "-maxrate:v:3", "2996k", "-bufsize:v:3", "4200k",
            "-map", "0:v:0", "-map", "0:a:0",
            "-s:v:4", "1920x1080", "-c:v:4", "libx264", "-b:v:4", "5000k", "-maxrate:v:4", "5500k", "-bufsize:v:4", "7500k",
            "-var_stream_map", "v:0,a:0 v:1,a:1 v:2,a:2 v:3,a:3 v:4,a:4",
            "-f", "hls",
            "-hls_time", "4",
            "-hls_playlist_type", "vod",
            "-hls_segment_filename", os.path.join(output_path, "output_%v_%03d.ts"),
            "-master_pl_name", "master.m3u8",
            os.path.join(output_path, "output_%v.m3u8")
        ]

        # Chạy lệnh FFmpeg
        print(f"Đang xử lý: {file}")
        subprocess.run(command, check=True)
        print(f"Hoàn thành: {file}")

print("Chuyển đổi hoàn tất!")

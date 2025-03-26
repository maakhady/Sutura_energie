# # -*- coding: utf-8 -*-
# from flask import Flask, Response
# import subprocess
# import time
# import os
# import signal

# app = Flask(__name__)

# # Variable globale pour suivre le processus de la camera
# camera_process = None

# @app.after_request
# def after_request(response):
#     response.headers.add('Access-Control-Allow-Origin', '*')
#     response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
#     response.headers.add('Access-Control-Allow-Methods', 'GET,OPTIONS')
#     return response

# def cleanup_camera():
#     """ Arrete proprement le processus de la camera """
#     global camera_process
#     if camera_process:Candidature Développeur Full Stack
#         try:
#             camera_process.terminate()
#             time.sleep(0.5)
#         except:
#             pass
#         camera_process = None

# @app.route('/video_feed')
# def video_feed():
#     """ Genere le flux video MJPEG """
#     def generate_frames():
#         global camera_process
        
#         # Nettoyer toute instance precedente
#         cleanup_camera()
        
#         # Commande pour diffuser la video directement
#         cmd = [
#             'rpicam-vid',
#             '-n',                # No preview
#             '-t', '0',           # No timeout
#             '-o', '-',           # Output to stdout
#             '--codec', 'mjpeg',  # MJPEG format
#             '--width', '640',    # Width
#             '--height', '480',   # Height
#             '--framerate', '25', # Framerate
#             '--inline',          # Inline headers for streaming
#             '--nopreview'        # Necessaire sur certains systemes
#         ]
        
#         # Démarrer le processus
#         camera_process = subprocess.Popen(cmd, stdout=subprocess.PIPE, bufsize=0)

#         # Envoyer l'entete MJPEG avant toute donnee
#         yield (b'--frameboundary\r\n' +
#                b'Content-Type: image/jpeg\r\n\r\n')

#         buffer = b''
#         try:
#             # Lire la sortie du processus en continu
#             while camera_process and camera_process.poll() is None:
#                 chunk = camera_process.stdout.read(4096)
#                 if not chunk:
#                     break
                
#                 buffer += chunk
                
#                 # Chercher les delimiters d'image JPEG (SOI et EOI)
#                 start_marker = buffer.find(b'\xff\xd8')  # SOI marker
#                 end_marker = buffer.find(b'\xff\xd9')    # EOI marker

#                 if start_marker != -1 and end_marker != -1 and end_marker > start_marker:
#                     # Extraire l'image complete
#                     frame = buffer[start_marker:end_marker+2]
#                     buffer = buffer[end_marker+2:]

#                     # Envoyer l'image au navigateur
#                     yield (b'--frameboundary\r\n' +
#                            b'Content-Type: image/jpeg\r\n' +
#                            b'Content-Length: ' + str(len(frame)).encode() + b'\r\n\r\n' +
#                            frame + b'\r\n')
#                     time.sleep(0.1)  # Ajouter un petit delai pour eviter la surcharge CPU
#         finally:
#             cleanup_camera()
    
#     return Response(generate_frames(),
#                     mimetype='multipart/x-mixed-replace; boundary=frameboundary')

# @app.route('/')
# def index():
#     """ Page d'accueil avec le flux video """
#     return """
#     <html>
#       <head>
#         <title>Flux Video Raspberry Pi</title>
#         <style>
#           body { font-family: Arial, sans-serif; text-align: center; margin: 0; padding: 20px; }
#           h1 { color: #333; }
#           .container { max-width: 800px; margin: 0 auto; }
#           .camera-feed { width: 100%; max-width: 800px; border: 1px solid #ddd; border-radius: 8px; }
#         </style>
#       </head>
#       <body>
#         <div class="container">
#           <h1>Flux Video Raspberry Pi</h1>
#           <img src="/video_feed" class="camera-feed">
#           <p>Serveur de streaming actif</p>
#         </div>
#       </body>
#     </html>
#     """

# # Gérer l'arret propre
# def signal_handler(sig, frame):
#     cleanup_camera()
#     print('Arret du serveur...')
#     os._exit(0)

# if __name__ == '__main__':
#     # Enregistrer les gestionnaires de signaux
#     signal.signal(signal.SIGINT, signal_handler)
#     signal.signal(signal.SIGTERM, signal_handler)
    
#     # Nettoyer au demarrage
#     subprocess.run(['pkill', '-f', 'rpicam'], stderr=subprocess.DEVNULL)
#     time.sleep(1)
    
#     print("Demarrage du serveur sur le port 7000...")
#     app.run(host='0.0.0.0', port=7000, threaded=True)

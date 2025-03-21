import usb.core
import usb.util
import serial
import time
import json
import requests
import threading
from flask import Flask, request, jsonify

# === Configuration ===
SERIAL_PORT = "/dev/ttyUSB0"  # Adapter selon ton port USB
BAUD_RATE = 115200
NODE_SERVER_URL = "http://192.168.1.5:2500/data"  # Adapter selon ton serveur

# === Initialisation du port série ===
ser = None

def connect_serial():
    """Tentative de connexion au port série"""
    global ser
    while ser is None:
        try:
            ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
            print("✅ Connexion série établie.")
        except serial.SerialException as e:
            print(f"⚠️ Erreur connexion série : {e}, nouvel essai dans 5s...")
            time.sleep(5)

connect_serial()

# === Configuration du module relais USB ===
VENDOR_ID = 0x16c0
PRODUCT_ID = 0x05df

device = usb.core.find(idVendor=VENDOR_ID, idProduct=PRODUCT_ID)
if device is None:
    raise ValueError("⚠️ Module relais USB non trouvé ! Vérifiez la connexion.")
if device.is_kernel_driver_active(0):
    device.detach_kernel_driver(0)
device.set_configuration()

# État des relais (False = OFF, True = ON)
relay_states = {i: False for i in range(1, 7)}

# === Gestion du relais ===
lock = threading.Lock()

def control_relay(channel, state):
    """
    Active/Désactive un relais via USB.
    Utilise un verrou pour éviter les conflits d'accès.
    """
    global relay_states

    if not (1 <= channel <= 6):
        print(f"⚠️ Numéro de relais invalide : {channel}")
        return

    # Ignorer si l'état est déjà celui demandé
    if relay_states[channel] == state:
        print(f"⚠️ Relais {channel} déjà {'ON' if state else 'OFF'}, action ignorée.")
        return

    with lock:
        cmd = [0] * 8
        cmd[0] = 0xFF if state else 0xFD  # Commande ON/OFF
        cmd[1] = channel
        device.ctrl_transfer(0x21, 0x09, 0x0200, 0, cmd)

        relay_states[channel] = state
        print(f"✅ Relais {channel} {'ON' if state else 'OFF'}")

        time.sleep(0.5)  # Délai pour éviter un envoi trop rapide

def read_serial():
    """Lecture en continu des valeurs de courant et envoi au serveur Node.js."""
    global ser

    while True:
        try:
            if ser is None or not ser.is_open:
                print("⚠️ Port série déconnecté, tentative de reconnexion...")
                connect_serial()

            if ser.in_waiting > 0:
                line = ser.readline().decode('utf-8').strip()

                # Vérifier si la ligne commence et finit bien par { et }
                if not (line.startswith("{") and line.endswith("}")):
                    print(f"⚠️ Donnée incomplète ignorée : {line}")
                    continue  # Passer à la prochaine ligne

                # Charger les données JSON
                try:
                    data = json.loads(line)
                    sensors = data.get("sensors", [])

                    if len(sensors) != 6:
                        print("⚠️ Erreur : Données capteurs invalides")
                        continue

                    # Filtrer les valeurs selon l'état des relais
                    payload = {"sensors": [0] * 6}
                    for i in range(6):
                        if relay_states[i + 1]:  # Si le relais est actif
                            payload["sensors"][i] = sensors[i]

                    # Envoyer seulement si au moins un relais est actif
                    if any(relay_states.values()):
                        response = requests.post(NODE_SERVER_URL, json=payload)
                        print(f"📡 Données envoyées : {payload}, Réponse: {response.status_code}")
                except json.JSONDecodeError:
                    print(f"⚠️ Erreur de décodage JSON. Ligne reçue : {line}")

            time.sleep(1)

        except serial.SerialException as e:
            print(f"⚠️ Problème de connexion série : {e}")
            ser.close()
            ser = None
            time.sleep(5)

# === API Flask pour contrôler les relais ===
app = Flask(__name__)

@app.route('/control-relay/<int:relay_id>', methods=['POST'])
def control_relay_api(relay_id):
    try:
        actif = request.json.get('actif')

        if actif is None:
            return jsonify({"message": "L'état 'actif' doit être spécifié."}), 400

        control_relay(relay_id, actif)

        return jsonify({"message": f"Relais {relay_id} {'activé' if actif else 'désactivé'} avec succès."}), 200

    except Exception as e:
        print(f"⚠️ Erreur API : {e}")
        return jsonify({"message": "Erreur lors du contrôle du relais.", "error": str(e)}), 500

# === Lancement des threads ===
if __name__ == "__main__":
    threading.Thread(target=read_serial, daemon=True).start()  # Thread pour la lecture série
    app.run(host="0.0.0.0", port=2500, debug=True)  # Serveur Flask

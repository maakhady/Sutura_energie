""" import usb.core
import usb.util
import time
from flask import Flask, request, jsonify

# Configuration de l'application Flask
app = Flask(__name__)

# Configuration du périphérique USB
VENDOR_ID = 0x16c0
PRODUCT_ID = 0x05df

# Trouver le module relais USB
device = usb.core.find(idVendor=VENDOR_ID, idProduct=PRODUCT_ID)

if device is None:
    raise ValueError("Module relais USB non trouvé. Vérifiez la connexion !")

if device.is_kernel_driver_active(0):
    device.detach_kernel_driver(0)

device.set_configuration()

def control_relay(channel, state):

    if not (1 <= channel <= 8):
        raise ValueError("Le numéro du relais doit être entre 1 et 8.")

    cmd = [0] * 8
    cmd[0] = 0xFF if state else 0xFD  # Commande ON/OFF
    cmd[1] = channel  

    # Envoi de la commande via USB
    device.ctrl_transfer(0x21, 0x09, 0x0200, 0, cmd)
    print(f"Relais {channel} {'ON' if state else 'OFF'}")

# Route pour activer/désactiver un relais
@app.route('/control-relay/<int:relay_id>', methods=['POST'])
def control_relay_api(relay_id):
    try:
        # Récupérer l'état du relais à partir du corps de la requête
        actif = request.json.get('actif')

        if actif is None:
            return jsonify({"message": "L'état 'actif' doit être spécifié."}), 400

        # Appeler la fonction de contrôle du relais
        control_relay(relay_id, actif)

        # Retourner une réponse JSON indiquant le succès
        return jsonify({"message": f"Relais {relay_id} {'activé' if actif else 'désactivé'} avec succès."}), 200

    except Exception as e:
        print(f"Erreur : {e}")
        return jsonify({"message": "Erreur lors du contrôle du relais.", "error": str(e)}), 500

if __name__ == "__main__":
    # Démarrer l'application Flask
    app.run(host="0.0.0.0", port=2500, debug=True)
  # Exposer l'API sur le port 2500
 """
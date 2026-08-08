# Certificados Apple Wallet

Esta carpeta debe contener los certificados necesarios para generar passes de Apple Wallet.

## Archivos necesarios

### 1. pass.pem
Certificado de Pass Type ID en formato PEM.

**Cómo obtenerlo:**
1. Ve a [Apple Developer Portal](https://developer.apple.com/account)
2. Certificates, Identifiers & Profiles → Identifiers → Pass Type IDs
3. Crea un nuevo Pass Type ID (ej: `pass.com.tuempresa.stampida`)
4. Genera un certificado para ese Pass Type ID
5. Descarga el `.cer` y conviértelo:

```bash
openssl x509 -in pass.cer -inform DER -outform PEM -out pass.pem
```

### 2. key.pem
Clave privada del certificado en formato PEM.

**Cómo obtenerlo:**
1. Exporta el certificado como `.p12` desde Keychain Access
2. Convierte a PEM:

```bash
openssl pkcs12 -in pass.p12 -nocerts -nodes -out key.pem
```

### 3. wwdr.pem
Apple Worldwide Developer Relations Intermediate Certificate.

**Cómo obtenerlo:**
1. Descarga desde: https://www.apple.com/certificateauthority/
2. Busca "Apple Worldwide Developer Relations Certification Authority"
3. Convierte a PEM si es necesario:

```bash
openssl x509 -in AppleWWDRCA.cer -inform DER -outform PEM -out wwdr.pem
```

### 4. apns_key.pem (para notificaciones push)
Key de APNs para enviar notificaciones de actualización.

**Cómo obtenerlo:**
1. En Apple Developer Portal → Keys
2. Crea una nueva key con capacidad "Apple Push Notifications service (APNs)"
3. Descarga el archivo `.p8`
4. Renómbralo a `apns_key.pem`

## Seguridad

⚠️ **IMPORTANTE**: Estos archivos NO deben subirse a git. Ya están en `.gitignore`.

Mantén estos certificados seguros. Si se comprometen, revócalos inmediatamente en Apple Developer Portal.

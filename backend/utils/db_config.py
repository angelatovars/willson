import pymysql
from settings.config import Config

def create_connection():
    try:
        connection = pymysql.connect(
            host=Config.MYSQL_HOST,
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD,
            db=Config.MYSQL_DB,
            cursorclass=pymysql.cursors.DictCursor
        )
        
        with connection.cursor() as cursor:
            # Añadir campo is_admin a la tabla usuarios si no existe
            try:
                cursor.execute("""
                    ALTER TABLE usuarios 
                    ADD COLUMN is_admin BOOLEAN DEFAULT 0
                """)
                connection.commit()
                print("Campo is_admin añadido correctamente")
            except pymysql.Error as e:
                if "Duplicate column name" in str(e):
                    print("Campo is_admin ya existe")
                else:
                    print(f"Error al añadir campo is_admin: {e}")

            # Crear tabla de tokens revocados
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS RevokedTokens (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    jti VARCHAR(36) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_jti (jti)
                )
            """)
            connection.commit()
            print("Tabla RevokedTokens verificada")

            # Crear tabla de configuración si no existe
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS configuracion (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    max_players INT DEFAULT 10,
                    time_limit INT DEFAULT 30,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            """)
            connection.commit()
            print("Tabla configuracion verificada")

            # Verificar si existe configuración inicial
            cursor.execute("SELECT COUNT(*) as count FROM configuracion")
            if cursor.fetchone()['count'] == 0:
                cursor.execute("""
                    INSERT INTO configuracion (max_players, time_limit)
                    VALUES (10, 30)
                """)
                connection.commit()
                print("Configuración inicial creada")

            # Crear usuario administrador por defecto si no existe
            cursor.execute("""
                INSERT IGNORE INTO usuarios 
                (nombre, correo, contraseña, edad, is_admin)
                VALUES 
                ('Administrador', 'admin@example.com', 'admin123', 25, 1)
            """)
            connection.commit()
            print("Usuario administrador verificado")

        return connection

    except pymysql.Error as e:
        print(f"Error conectando a la base de datos: {e}")
        return None

def add_token_to_blocklist(jti):
    """Añadir un token a la lista de revocados"""
    connection = create_connection()
    if connection:
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT IGNORE INTO RevokedTokens (jti)
                    VALUES (%s)
                """, (jti,))
                connection.commit()
                return True
        except pymysql.Error as e:
            print(f"Error al revocar token: {e}")
            return False
        finally:
            connection.close()
    return False

def is_token_revoked(jti):
    """Verificar si un token está revocado"""
    connection = create_connection()
    if connection:
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT id FROM RevokedTokens WHERE jti = %s", (jti,))
                return cursor.fetchone() is not None
        finally:
            connection.close()
    return True  # Por seguridad, si hay error de conexión consideramos el token revocado

# Las funciones existentes continúan igual...
def get_admin_config():
    """Obtener la configuración actual del juego"""
    connection = create_connection()
    if connection:
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM configuracion ORDER BY id DESC LIMIT 1")
                return cursor.fetchone()
        finally:
            connection.close()
    return None

def update_admin_config(max_players, time_limit):
    """Actualizar la configuración del juego"""
    connection = create_connection()
    if connection:
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    UPDATE configuracion 
                    SET max_players = %s, time_limit = %s 
                    WHERE id = (SELECT id FROM (SELECT id FROM configuracion ORDER BY id DESC LIMIT 1) as t)
                """, (max_players, time_limit))
                connection.commit()
                return True
        finally:
            connection.close()
    return False

def is_admin(user_id):
    """Verificar si un usuario es administrador"""
    connection = create_connection()
    if connection:
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT is_admin FROM usuarios WHERE id = %s", (user_id,))
                result = cursor.fetchone()
                return result and result['is_admin']
        finally:
            connection.close()
    return False

# Verificar conexión y configuración
if __name__ == '__main__':
    conn = create_connection()
    if conn:
        print("Conexión y configuración exitosa")
        conn.close()
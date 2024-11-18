from utils.db_config import create_connection
import pymysql


class UserModel:
    @staticmethod
    def create_user(nombre, correo, contraseña, edad):
        connection = create_connection()
        try:
            with connection.cursor() as cursor:
                query = """
                INSERT INTO Usuarios (nombre, correo, contraseña, edad)
                VALUES (%s, %s, %s, %s)
                """
                cursor.execute(query, (nombre, correo, contraseña, edad))
                connection.commit()
                user_id = cursor.lastrowid  # Aquí definimos correctamente user_id
                return user_id  # Retornamos el ID del usuario creado
        except Exception as e:
            print(f"Error al crear usuario: {e}")
            connection.rollback()
            return None
        finally:
            connection.close()
            
    @staticmethod
    def get_user_by_id(user_id):
        connection = create_connection()
        try:
            with connection.cursor(pymysql.cursors.DictCursor) as cursor:  # Usar DictCursor
                query = "SELECT * FROM Usuarios WHERE id_usuario = %s"
                cursor.execute(query, (user_id,))
                return cursor.fetchone()
        except Exception as e:
            print(f"Error al obtener usuario por ID: {e}")
            return None
        finally:
            connection.close()
    
    @staticmethod
    def get_user_by_email(correo):
        try:
            connection = create_connection()
            with connection.cursor(pymysql.cursors.DictCursor) as cursor:  # Usar DictCursor
                sql = "SELECT * FROM Usuarios WHERE correo = %s"
                cursor.execute(sql, (correo,))
                user = cursor.fetchone()  # Devuelve un diccionario en lugar de una tupla
                return user
        except Exception as e:
            print(f"Error al obtener usuario por correo: {e}")
            return None
        finally:
            connection.close()

    @staticmethod
    def update_user_profile(user_id, data):
        connection = create_connection()
        cursor = connection.cursor()

        query = """
        UPDATE Usuarios 
        SET nombre = %s, edad = %s, notificaciones = %s, 
            tema_preferido = %s, nivel_preferido = %s 
        WHERE id_usuario = %s
        """
        cursor.execute(query, (
            data['nombre'], 
            data['edad'], 
            data['notificaciones'], 
            data['tema_preferido'], 
            data['nivel_preferido'], 
            user_id
        ))

        connection.commit()
        connection.close()
        return cursor.rowcount > 0  # Devuelve True si se actualizaron filas


    @staticmethod
    def update_password(user_id, new_password):
        connection = create_connection()
        try:
            with connection.cursor() as cursor:
                query = "UPDATE Usuarios SET contraseña = %s WHERE id_usuario = %s"
                cursor.execute(query, (new_password, user_id))
                connection.commit()
                return cursor.rowcount > 0
        except Exception as e:
            print(f"Error al actualizar la contraseña: {e}")
            return False
        finally:
            connection.close()
from app.models.database import Base, engine, init_db
from sqlalchemy import text
print("Dropping schema public cascade...")
with engine.connect() as con:
    con.execute(text("DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO postgres; GRANT ALL ON SCHEMA public TO public;"))
    con.commit()
print("Creating all tables and seeding data...")
init_db()
print("Done.")

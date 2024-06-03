from sqlalchemy import Column, Integer, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

class HighScore(Base):
    __tablename__ = 'highscore'
    id = Column(Integer, primary_key=True)
    score = Column(Integer, nullable=False)

# Create an engine that stores data in the local directory's
# sqlite database file.
engine = create_engine('sqlite:///database.db')

# Create all tables in the engine.
Base.metadata.create_all(engine)

Session = sessionmaker(bind=engine)
session = Session()

if [ ! -f .env ]      
then
  export $(cat .env.development.local | xargs)
fi

export POSTGRES_PRISMA_URL="$POSTGRES_URL_NON_POOLING"
npx prisma studio
# Hello World

In web application development my skills are somewhat outdated. I asked few people on tips to improve on that.

Someone funnily told me I would be AWS React Guru if I would create Hello World React application, containerize
it with Docker and push it to AWS ECS.

This is by no means meant to be a guide how to do that, but a proof of skills. As such I won't be including
screenshots of what to do with AWS, but I will tell the steps what you need to configure.

# First step

Install npm, Docker and AWS Cli

    ## AWS Cli
    ```
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
    ```

    Test if it works and says it is AWS Cli version 2.
    ```
    aws --v
    ```


# Create React application and modify the code

Firstly install `create-react-app` 
```
sudo npm install -g create-react-app
```

Then create a project.
```
npx create-react-app my-application
```

The command created the project with folder and files for React application development. 

Now you just need to add NGINX configuration and Dockerfile.

Create folder `nginx` in the project root

Create a file `nginx.conf` in the previously created folder.

Add the following configuration with you own modifications to the `nginx/nginx.conf` file.

```
worker_processes  1;

events {
    worker_connections  1024;
}

http {
    server {
        listen 80;
        server_name  localhost;

        root   /usr/share/nginx/html;
        index  index.html index.htm;
        include /etc/nginx/mime.types;

        gzip on;
        gzip_min_length 1000;
        gzip_proxied expired no-cache no-store private auth;
        gzip_types text/plain text/css application/json application/javascript application/x-javascript text/xml application/xml application/xml+rss text/javascript;
e
```

Next you can add `Dockerfile` in the project root directory with the following code.
```
FROM node:lts-alpine as build 

WORKDIR /app

COPY package.json .
RUN npm install 
COPY . .
RUN npm run build

FROM nginx
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf 

COPY --from=build /app/build /usr/share/nginx/html 
```

# Then we need to Dockerize it.

Dockerize with the following command.
```
docker build -t my-application .
```

Then test run it with docker.

```
docker run -p 80:80 my-application
```

Then you can browse to `https://localhost:80` and see your React application Dockerized.

# Pushing the dockerized React app to AWS

Now that we have the dockerized react application done. We just need to configure AWS. 
I suppose you have created AWS account and administrator account with AWS Identity and Access Management (IAM). 
Though one note, create a budget alerts for your AWS account.

## Configure AWS Elastic Container Registry

Go to AWS Console and Elastic Container Registry. There `Create a repository` to have a place
where you push your docker image. The repository should be private.

## AWS Cli configure
After you've created the repository you can use AWS Cli to push the docker into ECR. Though
first you need to configure aws cli to have your AWS Access and secret keys configured.

Which you can find from you IAM administrator account Security Credentials. Create Access key
if you do not already have one.

So the following command with the previously installed AWS Cli is:

```
aws configure
```

Which will ask the following from you and you can supply your own configuration.
```
AWS Access Key ID []: key id
AWS Secret Access Key []: secret
Default region name []: eu-west-2
Default output format []: json
```

## Push the docker image into AWS ECR

First you need to tag your Docker image with the following command.

```
docker tag my-application (YOUR-ACCOUNT-ID).dkr.ecr.(REGION).amazonaws.com/my-application
```

Next you get the ECR login.
```
aws ecr get-login-password --region (REGION) | docker login --username AWS --pasword-stdin (YOUR-ACCOUNT-ID).dkr.ecr.(REGION).amazonaws.com
```

Then you can push your docker image.
```
docker push (YOUR-ACCOUNT-ID).dkr.ecr.(REGION).amazonaws.com/my-application
```

Now you can see in the AWS Console ECR Repository that the image has been pushed.

## Creating AWS Cluster

Go to AWS Console Elastic Container Service and Create Cluster.
Select Networking only and in the next step decide upon Cluster name then just create it.

## Creating AWS Task Definition

In the ECS create a new Task Definition, with launc type Fargate. Enter definition name
select task. Then select task size memory and CPU.

Now you should see next Add Container button. Press it. Supply container name, image
and port mapping like 80. Then just add it.

Now create the task definition.

## Creating a service

Next you create your service. Go to ECS Cluster and select the cluster.
Then create a service. 
Select Fargate. 
Select your task definition.
Select the cluster
Set number of tasks to 1.

Go to next step.
Select Cluster VPC and Subnet.

Go to next step, go to next step and create the service. 

## Checking public ip

From the ECS cluster tasks you can see your Public IP.

Then you just browse to the site.




FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src
COPY ["src/CustomerBot.Web.Host/CustomerBot.Web.Host.csproj", "src/CustomerBot.Web.Host/"]
COPY ["src/CustomerBot.Web.Core/CustomerBot.Web.Core.csproj", "src/CustomerBot.Web.Core/"]
COPY ["src/CustomerBot.Application/CustomerBot.Application.csproj", "src/CustomerBot.Application/"]
COPY ["src/CustomerBot.Core/CustomerBot.Core.csproj", "src/CustomerBot.Core/"]
COPY ["src/CustomerBot.EntityFrameworkCore/CustomerBot.EntityFrameworkCore.csproj", "src/CustomerBot.EntityFrameworkCore/"]
WORKDIR "/src/src/CustomerBot.Web.Host"
RUN dotnet restore 

WORKDIR /src
COPY ["src/CustomerBot.Web.Host", "src/CustomerBot.Web.Host"]
COPY ["src/CustomerBot.Web.Core", "src/CustomerBot.Web.Core"]
COPY ["src/CustomerBot.Application", "src/CustomerBot.Application"]
COPY ["src/CustomerBot.Core", "src/CustomerBot.Core"]
COPY ["src/CustomerBot.EntityFrameworkCore", "src/CustomerBot.EntityFrameworkCore"]
WORKDIR "/src/src/CustomerBot.Web.Host"
RUN dotnet publish -c Release -o /publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0
EXPOSE 80
WORKDIR /app
COPY --from=build /publish .
ENTRYPOINT ["dotnet", "CustomerBot.Web.Host.dll"]

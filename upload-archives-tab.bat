set MODELER_VERSION=5.20.bespoke.11
set UPLOAD_REPO_PATH = http://10.1.20.55:8082/nexus/content/groups/cuba-group/repositories/releases

cd modules\activiti-webapp-explorer2
call mvn assembly:single -Dcuba.modeler.version=%MODELER_VERSION% -P cuba --settings settings.xml
call mvn deploy:deploy-file -Dcuba.repository.url=%UPLOAD_REPO_PATH% -Dcuba.modeler.version=%MODELER_VERSION% -P cuba --settings settings.xml

cd ../..

cd modules\activiti-json-converter
call mvn package -Dcuba.modeler.version=%MODELER_VERSION% -P cuba,distro
call mvn deploy:deploy-file -Dcuba.repository.url=%UPLOAD_REPO_PATH% -Dcuba.modeler.version=%MODELER_VERSION% -P cuba --settings settings.xml

cd ../..




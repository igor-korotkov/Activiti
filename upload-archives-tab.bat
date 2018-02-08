set MODELER_VERSION=5.20.bespoke.7-SNAPSHOT

cd modules\activiti-webapp-explorer2
rem call mvn assembly:single -Dcuba.modeler.version=%MODELER_VERSION% -P cuba --settings settings.xml
call mvn deploy:deploy-file -Dcuba.repository.url=http://10.1.20.55:8082/nexus/content/groups/cuba-group/repositories/snapshots -Dcuba.modeler.version=%MODELER_VERSION% -P cuba --settings settings.xml

cd ../..

cd modules\activiti-json-converter
rem call mvn package -Dcuba.modeler.version=%MODELER_VERSION% -P cuba,distro
call mvn deploy:deploy-file -Dcuba.repository.url=http://10.1.20.55:8082/nexus/content/groups/cuba-group/repositories/snapshots -Dcuba.modeler.version=%MODELER_VERSION% -P cuba --settings settings.xml

cd ../..




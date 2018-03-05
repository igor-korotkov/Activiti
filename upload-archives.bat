set MODELER_VERSION=5.20.bespoke.10-SNAPSHOT

cd modules\activiti-webapp-explorer2
rem call mvn assembly:single -Dcuba.modeler.version=%MODELER_VERSION% -P cuba --settings settings.xml
call mvn deploy:deploy-file -Dcuba.repository.url=http://repository.haulmont.com:8587/nexus/content/repositories/snapshots -Dcuba.modeler.version=%MODELER_VERSION% -P cuba --settings settings.xml

cd ../..

cd modules\activiti-json-converter
rem call mvn package -Dcuba.modeler.version=%MODELER_VERSION% -P cuba,distro
call mvn deploy:deploy-file -Dcuba.repository.url=http://repository.haulmont.com:8587/nexus/content/repositories/snapshots -Dcuba.modeler.version=%MODELER_VERSION% -P cuba --settings settings.xml

cd ../..




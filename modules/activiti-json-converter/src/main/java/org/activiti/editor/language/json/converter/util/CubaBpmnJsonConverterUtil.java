package org.activiti.editor.language.json.converter.util;

import com.fasterxml.jackson.databind.JsonNode;
import org.activiti.bpmn.model.ExtensionAttribute;
import org.activiti.bpmn.model.ExtensionElement;
import org.activiti.bpmn.model.Process;
import org.activiti.editor.constants.CubaBpmnXMLConstants;
import org.activiti.editor.language.json.converter.BpmnJsonConverterUtil;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author gorbunkov
 * @version $Id$
 */
public class CubaBpmnJsonConverterUtil {

    public static void parseProcRoles(JsonNode procRolesNode, Process process) {
        List<ExtensionElement> procRoleExtensionElements = new ArrayList<ExtensionElement>();
        procRolesNode = BpmnJsonConverterUtil.validateIfNodeIsTextual(procRolesNode);
        for (JsonNode procRoleNode : procRolesNode) {
            String code = BpmnJsonConverterUtil.getValueAsString("code", procRoleNode);
            String name = BpmnJsonConverterUtil.getValueAsString("name", procRoleNode);
            ExtensionElement extensionElement = new ExtensionElement();
            extensionElement.setName("procRole");
            extensionElement.setNamespace(CubaBpmnXMLConstants.CUBA_NAMESPACE);
            extensionElement.setNamespacePrefix(CubaBpmnXMLConstants.CUBA_NAMESPACE_PREFIX);

            ExtensionAttribute codeAttribute = new ExtensionAttribute();
            codeAttribute.setName("code");
            codeAttribute.setValue(code);
            extensionElement.addAttribute(codeAttribute);
            ExtensionAttribute nameAttribute = new ExtensionAttribute();
            nameAttribute.setName("name");
            nameAttribute.setValue(name);
            extensionElement.addAttribute(nameAttribute);

            procRoleExtensionElements.add(extensionElement);
        }

        if (!procRoleExtensionElements.isEmpty()) {
            Map<String, List<ExtensionElement>> extensionElements = process.getExtensionElements();
            ExtensionElement procRolesExtensionElement = new ExtensionElement();
            procRolesExtensionElement.setName("procRoles");
            procRolesExtensionElement.setNamespace(CubaBpmnXMLConstants.CUBA_NAMESPACE);
            procRolesExtensionElement.setNamespacePrefix(CubaBpmnXMLConstants.CUBA_NAMESPACE_PREFIX);
            Map<String, List<ExtensionElement>> childElementsMap = new HashMap<String, List<ExtensionElement>>();
            childElementsMap.put("procRole", procRoleExtensionElements);
            procRolesExtensionElement.setChildElements(childElementsMap);
            List<ExtensionElement> list = new ArrayList<ExtensionElement>();
            list.add(procRolesExtensionElement);
            extensionElements.put("procRoles", list);
        }
    }
}
